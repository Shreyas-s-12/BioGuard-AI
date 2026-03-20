"""
BioGuard AI - Backend API
AI-powered Food Ingredient Risk Detection Platform
"""

import json
import re
import yaml
import csv
import io
import os
import shutil
from pathlib import Path
from typing import List, Dict, Optional, Any
from datetime import datetime

from fastapi import FastAPI, HTTPException, Query, Form, UploadFile, File
import pytesseract
from PIL import Image
import cv2
import numpy as np
from deep_translator import GoogleTranslator


def configure_tesseract() -> Optional[str]:
    """
    Configure Tesseract executable path for pytesseract.

    Resolution order:
    1) TESSERACT_CMD env var
    2) tesseract found in PATH
    3) Common Windows install locations
    """
    candidates = []

    env_cmd = os.getenv("TESSERACT_CMD")
    if env_cmd:
        candidates.append(env_cmd)

    path_cmd = shutil.which("tesseract")
    if path_cmd:
        candidates.append(path_cmd)

    candidates.extend(
        [
            r"C:\Program Files\Tesseract-OCR\tesseract.exe",
            r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        ]
    )

    for candidate in candidates:
        if candidate and Path(candidate).exists():
            pytesseract.pytesseract.tesseract_cmd = candidate
            print(f"DEBUG: Tesseract configured at: {candidate}")
            return candidate

    print(
        "DEBUG: Tesseract not found. Set TESSERACT_CMD or install Tesseract OCR "
        "from https://github.com/UB-Mannheim/tesseract/wiki"
    )
    return None


# Configure OCR engine path at startup.
configure_tesseract()


def translate_to_english(text: str, source_language: str = 'auto') -> str:
    """
    Translate text to English using Google Translator.
    
    Args:
        text: The text to translate
        source_language: The source language code (e.g., 'es', 'hi', 'kn'). 
                        Use 'auto' for automatic language detection.
    
    Returns:
        Translated text in English, or original text if translation fails.
    """
    if not text or not text.strip():
        return text
    
    try:
        # If source is 'auto', use automatic detection
        # Otherwise, use the specified language
        source = 'auto' if source_language == 'auto' else source_language
        translated = GoogleTranslator(source=source, target='en').translate(text)
        if translated:
            print(f"DEBUG: Translated from '{source_language}': '{text[:50]}...' -> '{translated[:50]}...'")
            return translated
        return text
    except Exception as e:
        print(f"DEBUG: Translation error: {str(e)}")
        return text


def should_auto_translate(text: str) -> bool:
    """
    Decide if auto-translation is worth attempting.
    For plain ASCII/English-like ingredient text, skip translation to avoid
    unnecessary external calls and latency.
    """
    if not text:
        return False
    # Attempt translation only when non-ASCII chars are present.
    return bool(re.search(r"[^\x00-\x7F]", text))

# Load chemicals data at startup
CHEMICALS_DATA = []
CHEMICALS_CSV_PATH = Path(__file__).parent / "data" / "chemicals.csv"

def load_chemicals_csv():
    """Load chemicals from CSV file."""
    global CHEMICALS_DATA
    chemicals = []
    
    try:
        with open(CHEMICALS_CSV_PATH, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Normalize e_number - extract just the E-number part
                e_number = row.get('e_number', '').strip()
                # Convert INS XXX to EXXX format for search
                if e_number.startswith('INS '):
                    e_number_ins = 'E' + e_number.replace('INS ', '').strip()
                else:
                    e_number_ins = e_number
                
                # Process aliases
                aliases = row.get('aliases', '').strip()
                
                chemical = {
                    'chemical_name': row.get('chemical_name', '').strip(),
                    'e_number': e_number,
                    'e_number_ins': e_number_ins,  # Store normalized E-number
                    'category': row.get('category', '').strip(),
                    'purpose': row.get('purpose', '').strip(),
                    'risk_level': row.get('risk_level', '').strip(),
                    'health_concerns': row.get('health_concerns', '').strip(),
                    'safe_limit': row.get('safe_limit', '').strip(),
                    'aliases': aliases
                }
                chemicals.append(chemical)
        
        CHEMICALS_DATA = chemicals
        print(f"DEBUG: Loaded chemicals: {len(chemicals)}")
    except Exception as e:
        print(f"ERROR: Failed to load chemicals CSV: {e}")
        CHEMICALS_DATA = []

# Load chemicals on module import
load_chemicals_csv()
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# Load configuration
CONFIG_PATH = Path(__file__).parent / "config.yaml"
with open(CONFIG_PATH, 'r') as f:
    CONFIG = yaml.safe_load(f)

app = FastAPI(
    title="BioGuard AI API",
    description="AI-powered Food Ingredient Risk Detection Platform",
    version="3.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class NutritionAnalysisRequest(BaseModel):
    nutrition_text: str

class FoodAnalysisRequest(BaseModel):
    """Request model for comprehensive food analysis."""
    ingredients: str
    nutrition_text: Optional[str] = ""
    language: Optional[str] = "auto"  # Source language for translation (auto-detect by default)
    health_condition: Optional[str] = None  # Personal health mode: diabetes, hypertension, heart_disease, kidney_disease, obesity, fatty_liver, pcos, thyroid_disorder, digestive_disorder, pregnancy


class NutritionValues(BaseModel):
    calories: Optional[float] = None
    sodium: Optional[float] = None
    fat: Optional[float] = None
    sugar: Optional[float] = None
    protein: Optional[float] = None


class DailyGoalsRequest(BaseModel):
    """Request model for personalized daily nutrition goals."""
    age: Optional[int] = None
    weight: Optional[float] = None
    goal: Optional[str] = None


class GroceryAnalysisRequest(BaseModel):
    """Request model for multi-item grocery analysis."""
    items: List[str]
    health_condition: Optional[str] = None
    health_mode: Optional[str] = None


class WeeklyMealPlanRequest(BaseModel):
    """Request model for weekly meal plan generation."""
    goal: Optional[str] = None
    diet_type: Optional[str] = "veg"  # veg, non-veg, eggetarian
    budget: Optional[str] = "medium"  # low, medium, high


def calculate_daily_nutrition_goals(
    age: Optional[int] = None,
    weight: Optional[float] = None,
    goal: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Calculate personalized daily nutrition goals with safe defaults.

    Returns:
    {
      "calories_goal": int,
      "protein_goal": int,
      "limits": {"sugar": int, "sodium": int}
    }
    """
    defaults = {
        "calories_goal": 2100,
        "protein_goal": 98,
        "limits": {"sugar": 30, "sodium": 2000},
    }

    try:
        safe_age = int(age) if age is not None else 25
        if safe_age < 10 or safe_age > 120:
            safe_age = 25

        safe_weight = float(weight) if weight is not None else 70.0
        if safe_weight < 25 or safe_weight > 300:
            safe_weight = 70.0

        normalized_goal = str(goal or "maintain").strip().lower()
        goal_aliases = {
            "weight loss": "weight_loss",
            "loss": "weight_loss",
            "weight_loss": "weight_loss",
            "weight gain": "weight_gain",
            "gain": "weight_gain",
            "weight_gain": "weight_gain",
            "maintain": "maintain",
            "maintenance": "maintain",
        }
        goal_mode = goal_aliases.get(normalized_goal, "maintain")

        base_calories = safe_weight * 30.0
        if safe_age >= 50:
            base_calories -= 100

        if goal_mode == "weight_loss":
            calories_goal = base_calories - 400
            protein_factor = 1.8
            sugar_limit = 25
            sodium_limit = 1800
        elif goal_mode == "weight_gain":
            calories_goal = base_calories + 300
            protein_factor = 2.0
            sugar_limit = 35
            sodium_limit = 2300
        else:
            calories_goal = base_calories
            protein_factor = 1.4
            sugar_limit = 30
            sodium_limit = 2000

        calories_goal = int(max(1200, min(4000, round(calories_goal))))
        protein_goal = int(max(40, min(260, round(safe_weight * protein_factor))))

        return {
            "calories_goal": calories_goal,
            "protein_goal": protein_goal,
            "limits": {
                "sugar": int(sugar_limit),
                "sodium": int(sodium_limit),
            },
        }
    except Exception:
        return defaults


def generate_weekly_meal_plan(goal: Optional[str] = None, diet_type: str = "veg", budget: str = "medium") -> Dict[str, List[str]]:
    """
    Generate weekly meal plan based on user goal, diet type, and budget.
    Returns day1..day7, each with [breakfast, lunch, dinner].
    Each meal includes budget tags: 💰 (low), 💰💰 (medium), 💰💰💰 (high)
    """
    
    # Budget symbols
    budget_low = "💰"
    budget_medium = "💰💰"
    budget_high = "💰💰💰"
    
    # Veg Plans
    veg_plans = {
        "maintain": {
            "low": {
                "day1": [f"Idli + chutney {budget_low}", f"Rice + dal {budget_low}", f"Roti + veg curry {budget_low}"],
                "day2": [f"Poha with peanuts {budget_low}", f"Sambar rice {budget_low}", f"Khichdi {budget_low}"],
                "day3": [f"Upma {budget_low}", f"Rajma + rice {budget_low}", f"Dal + roti {budget_low}"],
                "day4": [f"Dalia {budget_low}", f"Chole + chapati {budget_low}", f"Vegetable soup {budget_low}"],
                "day5": [f"Poha {budget_low}", f"Mixed veg + rice {budget_low}", f"Roti + dal {budget_low}"],
                "day6": [f"Besan chilla {budget_low}", f"Moong dal {budget_low}", f"Light pulao {budget_low}"],
                "day7": [f"Idli + sambar {budget_low}", f"Rice + salad {budget_low}", f"Curd + fruit {budget_low}"],
            },
            "medium": {
                "day1": [f"Oats with fruits {budget_medium}", f"Dal + brown rice + salad {budget_medium}", f"Vegetable soup + chapati {budget_medium}"],
                "day2": [f"Poha with peanuts {budget_medium}", f"Grilled paneer bowl {budget_medium}", f"Khichdi + curd {budget_medium}"],
                "day3": [f"Idli + sambar {budget_medium}", f"Roti + mixed veg + dal {budget_medium}", f"Millet upma + salad {budget_medium}"],
                "day4": [f"Greek yogurt + nuts {budget_medium}", f"Quinoa veggie bowl {budget_medium}", f"Moong chilla + chutney {budget_medium}"],
                "day5": [f"Besan chilla {budget_medium}", f"Rajma + rice + salad {budget_medium}", f"Vegetable stir fry + roti {budget_medium}"],
                "day6": [f"Fruit smoothie + seeds {budget_medium}", f"Chole + chapati {budget_medium}", f"Soup + paneer tikka {budget_medium}"],
                "day7": [f"Dalia + fruits {budget_medium}", f"Sambar rice + salad {budget_medium}", f"Light pulao + curd {budget_medium}"],
            },
            "high": {
                "day1": [f"Avocado toast + smoothie {budget_high}", f"Grilled paneer salad {budget_high}", f"Quinoa bowl + curd {budget_high}"],
                "day2": [f"Protein smoothie + nuts {budget_high}", f"Paneer tikka + rice {budget_high}", f"Vegetableextern  + soup {budget_high}"],
                "day3": [f"Greek yogurt parfait {budget_high}", f"Mixed veg paneer {budget_high}", f"Vegetableextern  + roti {budget_high}"],
                "day4": [f"Oats with dry fruits {budget_high}", f"Palak paneer + rice {budget_high}", f"Soup + salad {budget_high}"],
                "day5": [f"Fruit smoothie bowl {budget_high}", f"Vegetableextern  fried rice {budget_high}", f"Paneer bhurji + roti {budget_high}"],
                "day6": [f"Protein pancakes {budget_high}", f"Shahi paneer + rice {budget_high}", f"Vegetableextern  stir fry {budget_high}"],
                "day7": [f"Banana peanut butter toast {budget_high}", f"Dal makhani + rice {budget_high}", f"Curd + fruits {budget_high}"],
            }
        },
        "weight_loss": {
            "low": {
                "day1": [f"Poha (low oil) {budget_low}", f"Rice + dal {budget_low}", f"Roti + veg {budget_low}"],
                "day2": [f"Idli {budget_low}", f"Dal + rice {budget_low}", f"Khichdi {budget_low}"],
                "day3": [f"Upma {budget_low}", f"Moong dal {budget_low}", f"Vegetable soup {budget_low}"],
                "day4": [f"Dalia {budget_low}", f"Rajma {budget_low}", f"Dal + roti {budget_low}"],
                "day5": [f"Poha {budget_low}", f"Sprouts bowl {budget_low}", f"Vegetableextern  {budget_low}"],
                "day6": [f"Besan chilla {budget_low}", f"Chole {budget_low}", f"Soup {budget_low}"],
                "day7": [f"Idli + sambar {budget_low}", f"Rice + salad {budget_low}", f"Curd {budget_low}"],
            },
            "medium": {
                "day1": [f"Overnight oats + berries {budget_medium}", f"Grilled tofu salad {budget_medium}", f"Soup + sauteed veggies {budget_medium}"],
                "day2": [f"Veg omelette {budget_medium}", f"Quinoa + dal + salad {budget_medium}", f"Moong dal chilla {budget_medium}"],
                "day3": [f"Greek yogurt + chia {budget_medium}", f"Brown rice + mixed veg {budget_medium}", f"Paneer salad bowl {budget_medium}"],
                "day4": [f"Fruit + nuts {budget_medium}", f"Millet khichdi + salad {budget_medium}", f"Stir-fried vegetables {budget_medium}"],
                "day5": [f"Poha (low oil) {budget_medium}", f"Sprouts bowl + curd {budget_medium}", f"Vegetable soup + roti {budget_medium}"],
                "day6": [f"Oats + flaxseeds {budget_medium}", f"Grilled paneer + greens {budget_medium}", f"Dal soup + sauteed beans {budget_medium}"],
                "day7": [f"Smoothie bowl {budget_medium}", f"Chickpea salad {budget_medium}", f"Light khichdi + curd {budget_medium}"],
            },
            "high": {
                "day1": [f"Protein smoothie + berries {budget_high}", f"Grilled tofu quinoa bowl {budget_high}", f"Vegetableextern  soup {budget_high}"],
                "day2": [f"Egg white omelette {budget_high}", f"Salmon + veggies {budget_high}", f"Grilled chicken salad {budget_high}"],
                "day3": [f"Greek yogurt parfait {budget_high}", f"Grilled paneer steak {budget_high}", f"Zucchini noodles {budget_high}"],
                "day4": [f"Avocado + egg toast {budget_high}", f"Buddha bowl {budget_high}", f"Steamed veggies {budget_high}"],
                "day5": [f"Green smoothie {budget_high}", f"Grilled fish + rice {budget_high}", f"Protein bowl {budget_high}"],
                "day6": [f"Chia pudding {budget_high}", f"Tofu stir fry {budget_high}", f"Light veg {budget_high}"],
                "day7": [f"Acai bowl {budget_high}", f"Chickpea salad {budget_high}", f"Curd + nuts {budget_high}"],
            }
        },
        "weight_gain": {
            "low": {
                "day1": [f"Peanut butter toast {budget_low}", f"Rice + dal + ghee {budget_low}", f"Roti + potato {budget_low}"],
                "day2": [f"Bread + jam {budget_low}", f"Rice + rajma {budget_low}", f"Paratha {budget_low}"],
                "day3": [f"Banana shake {budget_low}", f"Rice + chole {budget_low}", f"Roti + dal {budget_low}"],
                "day4": [f"Milk + biscuits {budget_low}", f"Rice + paneer {budget_low}", f"Khichdi {budget_low}"],
                "day5": [f"Toast + peanut butter {budget_low}", f"Rice + dal {budget_low}", f"Vegetable pulao {budget_low}"],
                "day6": [f"Milk + banana {budget_low}", f"Roti + veg {budget_low}", f"Dal + rice {budget_low}"],
                "day7": [f"Oats + jaggery {budget_low}", f"Rice + sambar {budget_low}", f"Roti + curd {budget_low}"],
            },
            "medium": {
                "day1": [f"Peanut butter oats + banana {budget_medium}", f"Rice + dal + paneer {budget_medium}", f"Roti + veg + curd {budget_medium}"],
                "day2": [f"Eggs + toast + milk {budget_medium}", f"Chicken/soy curry + rice {budget_medium}", f"Khichdi + ghee + salad {budget_medium}"],
                "day3": [f"Smoothie + nuts {budget_medium}", f"Paneer wrap + sprouts {budget_medium}", f"Dal + rice + avocado {budget_medium}"],
                "day4": [f"Upma + curd + nuts {budget_medium}", f"Rajma rice + paneer {budget_medium}", f"Paratha + yogurt {budget_medium}"],
                "day5": [f"Banana shake + oats {budget_medium}", f"Chole rice + salad {budget_medium}", f"Tofu stir fry + noodles {budget_medium}"],
                "day6": [f"Dalia + dry fruits {budget_medium}", f"Quinoa + lentils + paneer {budget_medium}", f"Egg bhurji + roti {budget_medium}"],
                "day7": [f"Idli + peanut chutney {budget_medium}", f"Pulao + raita + soy chunks {budget_medium}", f"Soup + grilled paneer {budget_medium}"],
            },
            "high": {
                "day1": [f"Protein shake + banana {budget_high}", f"Grilled chicken + rice {budget_high}", f"Paneer tikka + roti {budget_high}"],
                "day2": [f"Avocado toast + eggs {budget_high}", f"Fish curry + rice {budget_high}", f"Chicken + salad {budget_high}"],
                "day3": [f"Peanut butter smoothie {budget_high}", f"Shahi paneer + naan {budget_high}", f"Dal makhani + rice {budget_high}"],
                "day4": [f"Oats with dry fruits {budget_high}", f"Chicken biryani {budget_high}", f"Fish + quinoa {budget_high}"],
                "day5": [f"Banana peanut butter shake {budget_high}", f"Grilled paneer bowl {budget_high}", f"Protein bowl {budget_high}"],
                "day6": [f"Protein pancakes {budget_high}", f"Chicken externally + rice {budget_high}", f"Paneer bhurji {budget_high}"],
                "day7": [f"French toast {budget_high}", f"Pulao + raita {budget_high}", f"Grilled fish + veggies {budget_high}"],
            }
        }
    }

    # Non-Veg Plans
    non_veg_plans = {
        "maintain": {
            "low": {
                "day1": [f"Boiled eggs + toast {budget_low}", f"Egg curry + rice {budget_low}", f"Roti + egg bhurji {budget_low}"],
                "day2": [f"Omelette + bread {budget_low}", f"Rice + fish curry {budget_low}", f"Egg soup + roti {budget_low}"],
                "day3": [f"Boiled eggs {budget_low}", f"Chicken curry + rice {budget_low}", f"Egg fried rice {budget_low}"],
                "day4": [f"Egg sandwich {budget_low}", f"Egg dal + rice {budget_low}", f"Roti + fish {budget_low}"],
                "day5": [f"Scrambled eggs {budget_low}", f"Rice + chicken {budget_low}", f"Egg curry {budget_low}"],
                "day6": [f"Toast + egg {budget_low}", f"Fish curry + rice {budget_low}", f"Chicken + roti {budget_low}"],
                "day7": [f"Eggs + milk {budget_low}", f"Egg + rice {budget_low}", f"Roti + chicken {budget_low}"],
            },
            "medium": {
                "day1": [f"Eggs + avocado toast {budget_medium}", f"Grilled chicken salad {budget_medium}", f"Fish curry + rice {budget_medium}"],
                "day2": [f"Omlette + fruits {budget_medium}", f"Chicken curry + rice {budget_medium}", f"Egg bhurji + roti {budget_medium}"],
                "day3": [f"Boiled eggs + nuts {budget_medium}", f"Fish tikka + quinoa {budget_medium}", f"Chicken soup {budget_medium}"],
                "day4": [f"Protein smoothie {budget_medium}", f"Chicken bowl {budget_medium}", f"Grilled fish + veggies {budget_medium}"],
                "day5": [f"Egg white omelette {budget_medium}", f"Chicken stir fry {budget_medium}", f"Egg + rice {budget_medium}"],
                "day6": [f"Yogurt + eggs {budget_medium}", f"Fish + rice {budget_medium}", f"Chicken salad {budget_medium}"],
                "day7": [f"Oats + eggs {budget_medium}", f"Chicken + dal {budget_medium}", f"Egg fried rice {budget_medium}"],
            },
            "high": {
                "day1": [f"Salmon + eggs {budget_high}", f"Grilled chicken steak {budget_high}", f"Fish externally + salad {budget_high}"],
                "day2": [f"Protein pancakes {budget_high}", f"Prawns curry + rice {budget_high}", f"Chicken tikka {budget_high}"],
                "day3": [f"Avocado + smoked salmon {budget_high}", f"Lamb curry + rice {budget_high}", f"Grilled fish {budget_high}"],
                "day4": [f"Eggs benedict {budget_high}", f"Chicken externally + quinoa {budget_high}", f"Fish externally  {budget_high}"],
                "day5": [f"Protein smoothie {budget_high}", f"Fish and chips {budget_high}", f"Chicken externally  {budget_high}"],
                "day6": [f"French toast + bacon {budget_high}", f"Grilled salmon {budget_high}", f"Chicken externally  {budget_high}"],
                "day7": [f"Shrimp breakfast {budget_high}", f"Mixed grill {budget_high}", f"Seafood pasta {budget_high}"],
            }
        },
        "weight_loss": {
            "low": {
                "day1": [f"Boiled eggs {budget_low}", f"Egg curry + rice {budget_low}", f"Grilled fish {budget_low}"],
                "day2": [f"Omelette (less oil) {budget_low}", f"Chicken soup {budget_low}", f"Egg + roti {budget_low}"],
                "day3": [f"Egg white {budget_low}", f"Fish + rice {budget_low}", f"Chicken salad {budget_low}"],
                "day4": [f"Boiled egg {budget_low}", f"Chicken + dal {budget_low}", f"Fish soup {budget_low}"],
                "day5": [f"Egg + toast {budget_low}", f"Rice + fish {budget_low}", f"Grilled chicken {budget_low}"],
                "day6": [f"Omelette {budget_low}", f"Chicken curry (less oil) {budget_low}", f"Egg bhurji {budget_low}"],
                "day7": [f"Eggs {budget_low}", f"Fish + rice {budget_low}", f"Chicken + roti {budget_low}"],
            },
            "medium": {
                "day1": [f"Egg white omelette {budget_medium}", f"Grilled chicken salad {budget_medium}", f"Steamed fish {budget_medium}"],
                "day2": [f"Boiled eggs + avocado {budget_medium}", f"Quinoa + chicken {budget_medium}", f"Egg bhurji + roti {budget_medium}"],
                "day3": [f"Greek yogurt + eggs {budget_medium}", f"Fish curry + rice {budget_medium}", f"Chicken soup {budget_medium}"],
                "day4": [f"Protein smoothie {budget_medium}", f"Grilled fish + veggies {budget_medium}", f"Egg + salad {budget_medium}"],
                "day5": [f"Egg + toast {budget_medium}", f"Chicken stir fry {budget_medium}", f"Fish + quinoa {budget_medium}"],
                "day6": [f"Oats + egg white {budget_medium}", f"Chicken bowl {budget_medium}", f"Grilled fish {budget_medium}"],
                "day7": [f"Smoothie bowl {budget_medium}", f"Chicken salad {budget_medium}", f"Egg + vegetables {budget_medium}"],
            },
            "high": {
                "day1": [f"Salmon + egg white {budget_high}", f"Grilled chicken breast {budget_high}", f"Steamed fish {budget_high}"],
                "day2": [f"Protein pancakes {budget_high}", f"Grilled salmon {budget_high}", f"Chicken externally  {budget_high}"],
                "day3": [f"Avocado + smoked salmon {budget_high}", f"Tuna salad {budget_high}", f"Grilled chicken {budget_high}"],
                "day4": [f"Eggs benedict {budget_high}", f"Shrimp quinoa bowl {budget_high}", f"Fish externally  {budget_high}"],
                "day5": [f"Green smoothie + eggs {budget_high}", f"Grilled tuna {budget_high}", f"Chicken externally  {budget_high}"],
                "day6": [f"Chia pudding + egg {budget_high}", f"Lobster salad {budget_high}", f"Fish externally  {budget_high}"],
                "day7": [f"Acai + egg white {budget_high}", f"Crab salad {budget_high}", f"Grilled seabass {budget_high}"],
            }
        },
        "weight_gain": {
            "low": {
                "day1": [f"Eggs + bread {budget_low}", f"Chicken curry + rice {budget_low}", f"Egg + roti {budget_low}"],
                "day2": [f"Milk + eggs {budget_low}", f"Egg curry + rice {budget_low}", f"Chicken + rice {budget_low}"],
                "day3": [f"Boiled eggs {budget_low}", f"Fish + rice {budget_low}", f"Egg fried rice {budget_low}"],
                "day4": [f"Bread + egg {budget_low}", f"Chicken + rice {budget_low}", f"Egg + dal {budget_low}"],
                "day5": [f"Egg shake {budget_low}", f"Egg + chapati {budget_low}", f"Chicken externally  {budget_low}"],
                "day6": [f"Eggs + milk {budget_low}", f"Fish curry {budget_low}", f"Egg + roti {budget_low}"],
                "day7": [f"Boiled eggs {budget_low}", f"Chicken rice {budget_low}", f"Egg + chapati {budget_low}"],
            },
            "medium": {
                "day1": [f"Eggs + toast + milk {budget_medium}", f"Chicken curry + rice {budget_medium}", f"Egg bhurji + roti {budget_medium}"],
                "day2": [f"Omelette + bread {budget_medium}", f"Fish curry + rice {budget_medium}", f"Chicken external + salad {budget_medium}"],
                "day3": [f"Peanut butter toast + eggs {budget_medium}", f"Chicken externally + rice {budget_medium}", f"Egg fried rice {budget_medium}"],
                "day4": [f"Banana shake + eggs {budget_medium}", f"Egg + chicken bowl {budget_medium}", f"Fish + quinoa {budget_medium}"],
                "day5": [f"Eggs + avocado {budget_medium}", f"Chicken stir fry {budget_medium}", f"Egg + chicken {budget_medium}"],
                "day6": [f"Oats + eggs + nuts {budget_medium}", f"Grilled chicken {budget_medium}", f"Fish externally  {budget_medium}"],
                "day7": [f"Protein smoothie {budget_medium}", f"Chicken + rice {budget_medium}", f"Egg + chicken {budget_medium}"],
            },
            "high": {
                "day1": [f"Protein shake + eggs {budget_high}", f"Grilled chicken steak {budget_high}", f"Fish externally + rice {budget_high}"],
                "day2": [f"Eggs benedict {budget_high}", f"Prawns curry {budget_high}", f"Chicken externally  {budget_high}"],
                "day3": [f"Avocado toast + salmon {budget_high}", f"Lamb externally  {budget_high}", f"Fish externally  {budget_high}"],
                "day4": [f"Peanut butter smoothie {budget_high}", f"Chicken biryani {budget_high}", f"Seafood externally  {budget_high}"],
                "day5": [f"French toast + bacon {budget_high}", f"Grilled salmon {budget_high}", f"Chicken externally  {budget_high}"],
                "day6": [f"Protein pancakes {budget_high}", f"Fish and chips {budget_high}", f"Lobster {budget_high}"],
                "day7": [f"Shrimp cocktail {budget_high}", f"Mixed grill {budget_high}", f"Crab feast {budget_high}"],
            }
        }
    }

    # Eggetarian Plans (similar to non-veg but no meat/fish)
    eggetarian_plans = {
        "maintain": veg_plans["maintain"].copy(),
        "weight_loss": veg_plans["weight_loss"].copy(),
        "weight_gain": veg_plans["weight_gain"].copy()
    }
    
    # Add egg dishes to eggetarian plans
    for goal_key in eggetarian_plans:
        for budget_key in eggetarian_plans[goal_key]:
            for day_key in eggetarian_plans[goal_key][budget_key]:
                meals = eggetarian_plans[goal_key][budget_key][day_key]
                # Add egg to some meals
                if "egg" not in meals[0].lower():
                    meals[0] = f"Egg {meals[0]}"
                if "egg" not in meals[1].lower() and "paneer" not in meals[1].lower():
                    meals[1] = f"Egg curry + {meals[1]}"

    # Vegan Plans (100% plant-based, no dairy, eggs, or animal products)
    vegan_plans = {
        "maintain": {
            "low": {
                "day1": [f"Poha with peanuts {budget_low}", f"Rice + dal {budget_low}", f"Roti + sabzi {budget_low}"],
                "day2": [f"Idli + chutney {budget_low}", f"Dal + rice {budget_low}", f"Khichdi {budget_low}"],
                "day3": [f"Upma {budget_low}", f"Chana masala + rice {budget_low}", f"Roti + dal {budget_low}"],
                "day4": [f"Dalia {budget_low}", f"Rajma + rice {budget_low}", f"Vegetable soup {budget_low}"],
                "day5": [f"Poha {budget_low}", f"Mixed veg + rice {budget_low}", f"Roti + chana {budget_low}"],
                "day6": [f"Besan chilla {budget_low}", f"Moong dal {budget_low}", f"Light pulao {budget_low}"],
                "day7": [f"Idli + sambar {budget_low}", f"Rice + salad {budget_low}", f"Cucumber + peanuts {budget_low}"],
            },
            "medium": {
                "day1": [f"Oats with banana {budget_medium}", f"Tofu stir fry + rice {budget_medium}", f"Roti + mixed veg {budget_medium}"],
                "day2": [f"Poha with peanuts {budget_medium}", f"Soya chunks curry + rice {budget_medium}", f"Khichdi {budget_medium}"],
                "day3": [f"Upma with vegetables {budget_medium}", f"Chole + rice {budget_medium}", f"Roti + dal {budget_medium}"],
                "day4": [f"Dalia with nuts {budget_medium}", f"Rajma + rice {budget_medium}", f"Sprouts salad {budget_medium}"],
                "day5": [f"Poha {budget_medium}", f"Tofu curry + rice {budget_medium}", f"Roti + chana {budget_medium}"],
                "day6": [f"Besan chilla {budget_medium}", f"Soya curry + rice {budget_medium}", f"Vegetable soup {budget_medium}"],
                "day7": [f"Idli + sambar {budget_medium}", f"Rice + dal tadka {budget_medium}", f"Curd alternative + fruits {budget_medium}"],
            },
            "high": {
                "day1": [f"Avocado toast + almond milk {budget_high}", f"Tofu steak + quinoa {budget_high}", f"Vegetableextern  + soup {budget_high}"],
                "day2": [f"Protein smoothie (plant milk) {budget_high}", f"Soya externally + rice {budget_high}", f"Grilled tofu salad {budget_high}"],
                "day3": [f"Greek yogurt alternative {budget_high}", f"Palak tofu + rice {budget_high}", f"Quinoa bowl {budget_high}"],
                "day4": [f"Oats with dry fruits {budget_high}", f"Tofu biryani {budget_high}", f"Vegetableextern  {budget_high}"],
                "day5": [f"Smoothie bowl {budget_high}", f"Tofu externally + noodles {budget_high}", f"Tofu externally  {budget_high}"],
                "day6": [f"Protein pancakes {budget_high}", f"Tofu externally  {budget_high}", f"Vegetableextern  stir fry {budget_high}"],
                "day7": [f"Banana peanut butter toast {budget_high}", f"Dal makhani (no dairy) + rice {budget_high}", f"Curd alternative + fruits {budget_high}"],
            }
        },
        "weight_loss": {
            "low": {
                "day1": [f"Poha (low oil) {budget_low}", f"Rice + dal {budget_low}", f"Roti + sabzi {budget_low}"],
                "day2": [f"Idli {budget_low}", f"Moong dal {budget_low}", f"Khichdi {budget_low}"],
                "day3": [f"Upma {budget_low}", f"Chana {budget_low}", f"Vegetable soup {budget_low}"],
                "day4": [f"Dalia {budget_low}", f"Rajma {budget_low}", f"Dal + roti {budget_low}"],
                "day5": [f"Poha {budget_low}", f"Sprouts bowl {budget_low}", f"Vegetable {budget_low}"],
                "day6": [f"Besan chilla {budget_low}", f"Chole {budget_low}", f"Soup {budget_low}"],
                "day7": [f"Idli + sambar {budget_low}", f"Rice + salad {budget_low}", f"Cucumber {budget_low}"],
            },
            "medium": {
                "day1": [f"Oats with berries {budget_medium}", f"Tofu salad {budget_medium}", f"Soup + vegetables {budget_medium}"],
                "day2": [f"Poha with peanuts {budget_medium}", f"Soya curry + rice {budget_medium}", f"Moong dal chilla {budget_medium}"],
                "day3": [f"Greek yogurt alternative {budget_medium}", f"Tofu + mixed veg {budget_medium}", f"Tofu salad bowl {budget_medium}"],
                "day4": [f"Fruit + nuts {budget_medium}", f"Tofu khichdi + salad {budget_medium}", f"Stir-fried vegetables {budget_medium}"],
                "day5": [f"Poha (low oil) {budget_medium}", f"Sprouts bowl {budget_medium}", f"Vegetable soup + roti {budget_medium}"],
                "day6": [f"Oats + seeds {budget_medium}", f"Tofu + greens {budget_medium}", f"Dal soup + beans {budget_medium}"],
                "day7": [f"Smoothie bowl {budget_medium}", f"Chickpea salad {budget_medium}", f"Light khichdi {budget_medium}"],
            },
            "high": {
                "day1": [f"Protein smoothie + berries {budget_high}", f"Tofu quinoa bowl {budget_high}", f"Vegetable soup {budget_high}"],
                "day2": [f"Tofu omelette {budget_high}", f"Salmon + veggies {budget_high}", f"Grilled chicken salad {budget_high}"],
                "day3": [f"Greek yogurt parfait {budget_high}", f"Grilled paneer steak {budget_high}", f"Zucchini noodles {budget_high}"],
                "day4": [f"Avocado + egg toast {budget_high}", f"Buddha bowl {budget_high}", f"Steamed veggies {budget_high}"],
                "day5": [f"Green smoothie {budget_high}", f"Grilled fish + rice {budget_high}", f"Protein bowl {budget_high}"],
                "day6": [f"Chia pudding {budget_high}", f"Tofu stir fry {budget_high}", f"Light extern  {budget_high}"],
                "day7": [f"Acai bowl {budget_high}", f"Chickpea salad {budget_high}", f"Curd + nuts {budget_high}"],
            }
        },
        "weight_gain": {
            "low": {
                "day1": [f"Peanut butter toast {budget_low}", f"Rice + dal + ghee {budget_low}", f"Roti + potato {budget_low}"],
                "day2": [f"Bread + jam {budget_low}", f"Rice + chana {budget_low}", f"Paratha {budget_low}"],
                "day3": [f"Banana shake {budget_low}", f"Rice + chole {budget_low}", f"Roti + dal {budget_low}"],
                "day4": [f"Milk alternative + biscuits {budget_low}", f"Rice + tofu {budget_low}", f"Khichdi {budget_low}"],
                "day5": [f"Toast + peanut butter {budget_low}", f"Rice + dal {budget_low}", f"Vegetable pulao {budget_low}"],
                "day6": [f"Milk alternative + banana {budget_low}", f"Roti + veg {budget_low}", f"Dal + rice {budget_low}"],
                "day7": [f"Oats + jaggery {budget_low}", f"Rice + sambar {budget_low}", f"Roti + tofu {budget_low}"],
            },
            "medium": {
                "day1": [f"Peanut butter oats + banana {budget_medium}", f"Rice + dal + tofu {budget_medium}", f"Roti + veg + curd alt {budget_medium}"],
                "day2": [f"Tofu scramble + toast + plant milk {budget_medium}", f"Tofu curry + rice {budget_medium}", f"Khichdi + peanuts {budget_medium}"],
                "day3": [f"Smoothie + nuts {budget_medium}", f"Tofu wrap + sprouts {budget_medium}", f"Dal + rice + tofu {budget_medium}"],
                "day4": [f"Upma + curd alt + nuts {budget_medium}", f"Rajma rice + tofu {budget_medium}", f"Paratha + peanut butter {budget_medium}"],
                "day5": [f"Banana shake + oats {budget_medium}", f"Chole rice + salad {budget_medium}", f"Tofu stir fry + noodles {budget_medium}"],
                "day6": [f"Dalia + dry fruits {budget_medium}", f"Quinoa + lentils + tofu {budget_medium}", f"Tofu bhurji + roti {budget_medium}"],
                "day7": [f"Idli + peanut chutney {budget_medium}", f"Pulao + raita + tofu {budget_medium}", f"Soup + grilled tofu {budget_medium}"],
            },
            "high": {
                "day1": [f"Protein shake + banana {budget_high}", f"Tofu steak + rice {budget_high}", f"Tofu tikka + roti {budget_high}"],
                "day2": [f"Avocado toast + tofu {budget_high}", f"Tofu curry + rice {budget_high}", f"Tofu salad {budget_high}"],
                "day3": [f"Peanut butter smoothie {budget_high}", f"Tofu externally + naan {budget_high}", f"Dal makhani + rice {budget_high}"],
                "day4": [f"Oats with dry fruits {budget_high}", f"Tofu biryani {budget_high}", f"Tofu + quinoa {budget_high}"],
                "day5": [f"Banana peanut butter shake {budget_high}", f"Tofu bowl {budget_high}", f"Tofu externally  {budget_high}"],
                "day6": [f"Protein pancakes {budget_high}", f"Tofu externally + rice {budget_high}", f"Tofu bhurji {budget_high}"],
                "day7": [f"French toast {budget_high}", f"Pulao + raita {budget_high}", f"Grilled tofu + veggies {budget_high}"],
            }
        }
    }

    try:
        # Normalize parameters
        normalized_goal = str(goal or "maintain").strip().lower()
        if normalized_goal in ["weight loss", "loss", "weight_loss"]:
            goal_key = "weight_loss"
        elif normalized_goal in ["weight gain", "gain", "weight_gain"]:
            goal_key = "weight_gain"
        else:
            goal_key = "maintain"
        
        normalized_diet = str(diet_type or "veg").strip().lower()
        if normalized_diet in ["non-veg", "non_veg", "nonveg"]:
            diet_plans = non_veg_plans
            diet_key = "non-veg"
        elif normalized_diet in ["egg", "eggetarian"]:
            diet_plans = eggetarian_plans
            diet_key = "eggetarian"
        elif normalized_diet in ["vegan", "plant-based", "plant_based"]:
            diet_plans = vegan_plans
            diet_key = "vegan"
        else:
            diet_plans = veg_plans
            diet_key = "veg"
        
        normalized_budget = str(budget or "medium").strip().lower()
        if normalized_budget in ["low", "cheap", "budget"]:
            budget_key = "low"
        elif normalized_budget in ["high", "expensive", "premium"]:
            budget_key = "high"
        else:
            budget_key = "medium"
        
        return diet_plans[goal_key][budget_key]
    except Exception:
        return veg_plans["maintain"]["medium"]

# Disease Knowledge Mapping Dictionary
DISEASE_MAPPING = {
    # Nutritional Factors
    "sodium": [
        "hypertension",
        "cardiovascular disease",
        "kidney stress",
        "fluid retention",
        "stroke risk"
    ],
    "sugar": [
        "type 2 diabetes",
        "weight gain",
        "tooth decay",
        "heart disease",
        "fatty liver disease"
    ],
    "fat": [
        "obesity",
        "heart disease",
        "high cholesterol",
        "inflammation"
    ],
    "saturated fat": [
        "heart disease",
        "high LDL cholesterol",
        "atherosclerosis"
    ],
    "trans fat": [
        "heart disease",
        "stroke",
        "type 2 diabetes",
        "inflammation"
    ],
    "caffeine": [
        "sleep disorders",
        "anxiety",
        "increased heart rate",
        "high blood pressure",
        "digestive issues"
    ],
    
    # Artificial Sweeteners
    "aspartame": [
        "metabolic disorders",
        "neurological symptoms",
        "headaches",
        "phenylketonuria risk"
    ],
    "sucralose": [
        "gut bacteria disruption",
        "metabolic changes",
        "possible carcinogenic concerns"
    ],
    "saccharin": [
        "bladder tumors (historical concern)",
        "metabolic disturbances"
    ],
    "acesulfame potassium": [
        "possible carcinogenic concerns",
        "metabolic disturbances"
    ],
    "stevia": [
        "generally safe",
        "low risk"
    ],
    "sugar alcohols": [
        "digestive issues",
        "gas and bloating",
        "laxative effects"
    ],
    "sorbitol": [
        "digestive issues",
        "laxative effect"
    ],
    "maltitol": [
        "digestive issues",
        "laxative effect",
        "blood sugar impact"
    ],
    "xylitol": [
        "digestive issues",
        "hypoglycemia risk"
    ],
    
    # Preservatives
    "sodium benzoate": [
        "possible carcinogenic interaction with vitamin C",
        "allergic reactions"
    ],
    "potassium benzoate": [
        "hyperactivity in children",
        "possible carcinogenic interaction with vitamin C"
    ],
    "sodium nitrite": [
        "cancer risk",
        "nitrosamine formation"
    ],
    "sodium nitrate": [
        "cancer risk",
        "kidney damage"
    ],
    "BHA": [
        "possible carcinogen at high doses",
        "endocrine disruption"
    ],
    "BHT": [
        "controversial health effects",
        "possible carcinogen"
    ],
    "TBHQ": [
        "stomach tumors in animals",
        "liver enlargement"
    ],
    "sodium metabisulfite": [
        "allergic reactions",
        "asthma triggers",
        "sulfur dioxide sensitivity"
    ],
    "sulfur dioxide": [
        "asthma triggers",
        "allergic reactions",
        "respiratory issues"
    ],
    "parabens": [
        "endocrine disruption",
        "hormonal imbalance",
        "reproductive issues"
    ],
    
    # Food Additives
    "monosodium glutamate": [
        "headaches",
        "nausea in sensitive individuals",
        "MSG symptom complex"
    ],
    "phosphoric acid": [
        "bone mineral loss",
        "kidney stress",
        "dental erosion"
    ],
    "carrageenan": [
        "digestive issues",
        "gut inflammation",
        "intestinal damage"
    ],
    "artificial colors": [
        "hyperactivity in children",
        "allergic reactions",
        "behavioral issues"
    ],
    "allura red": [
        "hyperactivity in children",
        "possible carcinogen",
        "allergic reactions"
    ],
    "tartrazine": [
        "hyperactivity in children",
        "hives",
        "asthma triggers"
    ],
    "sunset yellow": [
        "hyperactivity in children",
        "allergic reactions"
    ],
    "caramel color": [
        "possible carcinogen (4-MEI)",
        "cancer risk"
    ],
    "titanium dioxide": [
        "DNA damage",
        "possible carcinogen",
        "intestinal inflammation"
    ],
    
    # Other Common Factors
    "high fructose corn syrup": [
        "fatty liver disease",
        "insulin resistance",
        "weight gain",
        "heart disease"
    ],
    "processed food": [
        "weight gain",
        "heart disease",
        "reduced nutrient intake"
    ],
    "refined carbohydrates": [
        "blood sugar spikes",
        "weight gain",
        "inflammation"
    ],
    "artificial flavor": [
        "possible neurological effects",
        "allergic reactions"
    ],
    "natural flavor": [
        "may contain allergens",
        "hidden ingredients"
    ],
    "modified food starch": [
        "reduced nutritional value",
        "digestive issues"
    ],
    "hydrogenated oil": [
        "heart disease",
        "increased cholesterol",
        "inflammation"
    ],
    "palm oil": [
        "saturated fat concerns",
        "environmental impact"
    ],
}

# Factor detection patterns
NUTRITION_PATTERNS = {
    'calories': re.compile(r'calories\s*[:\s]\s*(\d+)', re.IGNORECASE),
    'sodium': re.compile(r'sodium\s*[:\s]\s*(\d+)\s*mg', re.IGNORECASE),
    'fat': re.compile(r'(?:total\s+)?fat\s*[:\s]\s*(\d+)g?', re.IGNORECASE),
    'sugar': re.compile(r'(?:total\s+)?sugars?\s*[:\s]\s*(\d+)g?', re.IGNORECASE),
    'protein': re.compile(r'protein\s*[:\s]\s*(\d+)g?', re.IGNORECASE),
}

# ============================================
# DATABASE-DRIVEN CHEMICAL DETECTION SYSTEM
# ============================================

# Build chemical index for fast lookup
CHEMICAL_INDEX = {}  # Maps normalized terms to chemical entries
CHEMICALS_DB = []  # List of all unique chemicals

def build_chemical_index():
    """Build an index for fast chemical detection from the database."""
    global CHEMICAL_INDEX, CHEMICALS_DB
    
    # Deduplicate chemicals by name
    seen_names = set()
    unique_chemicals = []
    
    for chem in CHEMICALS_DATA:
        name = chem.get('chemical_name', '').lower().strip()
        if name and name not in seen_names:
            seen_names.add(name)
            unique_chemicals.append(chem)
    
    CHEMICALS_DB = unique_chemicals
    
    # Build index
    for chem in CHEMICALS_DB:
        # Add chemical name
        name = chem.get('chemical_name', '').lower().strip()
        if name:
            CHEMICAL_INDEX[name] = chem
        
        # Add aliases (comma-separated)
        aliases = chem.get('aliases', '').lower().strip()
        if aliases:
            for alias in aliases.split(','):
                alias = alias.strip()
                if alias:
                    CHEMICAL_INDEX[alias] = chem
        
        # Add e_number (normalized)
        e_num = chem.get('e_number_ins', '').lower().strip()
        if e_num:
            CHEMICAL_INDEX[e_num] = chem
            # Also add without INS prefix
            if e_num.startswith('e'):
                CHEMICAL_INDEX[e_num] = chem
            elif e_num.startswith('ins'):
                CHEMICAL_INDEX['e' + e_num.replace('ins', '').strip()] = chem
        
        # Add E-number variations
        e_num_raw = chem.get('e_number', '').strip()
        if e_num_raw:
            # Extract numeric part
            if 'INS' in e_num_raw.upper():
                num_part = ''.join(filter(str.isdigit, e_num_raw))
                if num_part:
                    CHEMICAL_INDEX[f'e{num_part}'] = chem
    
    print(f"DEBUG: Built chemical index with {len(CHEMICAL_INDEX)} entries")

# Build the index after loading chemicals
build_chemical_index()


def detect_chemicals_from_ingredients(ingredient_text: str) -> List[Dict]:
    """
    Detect chemicals from ingredient text using database matching.
    Matches by: chemical_name, aliases, e_number, INS numbers.
    
    Returns list of detected chemicals with their details.
    Uses CHEMICAL_INDEX for fast lookup (STEP 10).
    """
    if not ingredient_text:
        return []
    
    # Normalize ingredient text
    ingredient_lower = ingredient_text.lower()
    # Remove common prefixes and normalize
    ingredient_normalized = re.sub(r'[^\w\s]', ' ', ingredient_lower)
    ingredient_words = set(ingredient_normalized.split())
    
    detected = []
    detected_names = set()
    
    # Strategy 1: Check for E-number patterns (E621, INS 621, 621) first
    e_pattern = re.compile(r'(?:e|ins?\s*)(\d{3,4})', re.IGNORECASE)
    e_matches = e_pattern.findall(ingredient_text)
    
    for e_num in e_matches:
        e_key = f'e{e_num}'
        if e_key in CHEMICAL_INDEX:
            chem = CHEMICAL_INDEX[e_key]
            name = chem.get('chemical_name', '')
            if name not in detected_names:
                detected.append({
                    'chemical_name': chem.get('chemical_name', ''),
                    'e_number': chem.get('e_number', ''),
                    'category': chem.get('category', ''),
                    'risk_level': chem.get('risk_level', ''),
                    'health_concerns': chem.get('health_concerns', ''),
                    'safe_limit': chem.get('safe_limit', ''),
                    'match_type': 'e_number'
                })
                detected_names.add(name.lower())
    
    # Strategy 2: Check for chemical names and aliases in the index
    # Sort by length (longest first) to match longer names first (avoid false positives)
    # Filter to only include terms that are 4+ characters to avoid short false matches
    sorted_terms = sorted(
        [term for term in CHEMICAL_INDEX.keys() if len(term) >= 4],
        key=len,
        reverse=True
    )
    
    # Track already matched term suffixes to avoid partial matches
    matched_term_suffixes = set()
    
    for term in sorted_terms:
        # Skip if this term is a suffix of an already matched longer term
        # This prevents "sodium benzoate" from matching when "potassium benzoate" was matched
        skip_term = False
        for matched_suffix in matched_term_suffixes:
            if term.endswith(matched_suffix) or term in matched_suffix:
                skip_term = True
                break
        if skip_term:
            continue
        
        # Create a regex pattern to match whole word/phrase
        # Use word boundaries to avoid partial matches
        term_pattern = re.compile(r'\b' + re.escape(term) + r'\b', re.IGNORECASE)
        
        if term_pattern.search(ingredient_text):
            chem = CHEMICAL_INDEX[term]
            name = chem.get('chemical_name', '')
            name_lower = name.lower()
            
            if name_lower not in detected_names:
                detected.append({
                    'chemical_name': chem.get('chemical_name', ''),
                    'e_number': chem.get('e_number', ''),
                    'category': chem.get('category', ''),
                    'risk_level': chem.get('risk_level', ''),
                    'health_concerns': chem.get('health_concerns', ''),
                    'safe_limit': chem.get('safe_limit', ''),
                    'match_type': 'name_or_alias'
                })
                detected_names.add(name_lower)
                # Add this term's key parts to matched suffixes to prevent overlapping matches
                # For "potassium benzoate", add "benzoate" to prevent "sodium benzoate" matching
                words_in_term = name.split()
                if len(words_in_term) > 1:
                    # Add the last word(s) as suffixes to prevent partial matches
                    matched_term_suffixes.add(words_in_term[-1].lower())
    
    return detected


# Hidden ingredient aliases mapping.
HIDDEN_INGREDIENT_ALIASES: Dict[str, str] = {
    "dextrose": "sugar",
    "maltose": "sugar",
    "e621": "MSG",
    "aspartame": "artificial sweetener",
}


def detect_hidden_ingredient_aliases(ingredient_text: str) -> List[Dict[str, str]]:
    """
    Detect hidden ingredient aliases from ingredient text.

    Returns:
        [
            {"original": "dextrose", "actual": "sugar"},
            ...
        ]
    """
    if not ingredient_text or not ingredient_text.strip():
        return []

    ingredients = re.split(r"[,;\n\r]+", ingredient_text)
    hidden_ingredients: List[Dict[str, str]] = []
    seen_aliases = set()

    for raw_item in ingredients:
        original_item = raw_item.strip()
        if not original_item:
            continue

        normalized_item = re.sub(r"[^a-z0-9\s]", " ", original_item.lower())
        normalized_item = re.sub(r"\s+", " ", normalized_item).strip()
        if not normalized_item:
            continue

        for alias, actual in HIDDEN_INGREDIENT_ALIASES.items():
            alias_key = alias.lower().strip()
            if alias_key in seen_aliases:
                continue

            if re.search(rf"\b{re.escape(alias_key)}\b", normalized_item):
                hidden_ingredients.append({
                    "original": original_item,
                    "actual": actual
                })
                seen_aliases.add(alias_key)
                break

    return hidden_ingredients


# Risk level score mapping (STEP 3)
RISK_LEVEL_SCORES = {
    'low': 10,
    'moderate': 40,
    'high': 80,
    'minimal': 5
}

# Additive density factor (STEP 4)
ADDITIVE_DENSITY_BONUS = {
    (1, 2): 5,
    (3, 5): 15,
    (6, 100): 30  # 6 or more
}

# Nutrition impact scoring - REVISED for high sugar handling
# STEP 2: Higher weights for sugar and other nutrition issues
NUTRITION_IMPACT_SCORES = {
    'sugar': 35,       # High sugar >= 25g - increased from 20
    'sugar_moderate': 20,  # Moderate sugar 10-24g - NEW
    'added_sugar': 35,  # Added sugar - new
    'sodium': 20,       # High sodium - increased from 15
    'saturated_fat': 20,  # Saturated fat - increased from 15
    'trans_fat': 40     # Trans fat - increased from 30
}

# Nutrition thresholds for detection - REVISED for stricter sugar detection
# STEP 1: Updated thresholds to detect high sugar correctly
NUTRITION_DETECTION_THRESHOLDS = {
    'sugar': 25,       # g - HIGH sugar threshold increased from 15
    'sugar_moderate': 10,  # g - MODERATE sugar threshold - NEW
    'added_sugar': 10, # g - Added sugar detection
    'sodium': 600,     # mg - high sodium
    'saturated_fat': 5,  # g - high saturated fat
    'trans_fat': 0.5   # g - any trans fat is concerning
}


def calculate_comprehensive_risk_score(detected_chemicals: List[Dict], nutrition_values: Dict[str, float], ingredient_text: str = "") -> Dict[str, Any]:
    """
    Calculate risk score using the new comprehensive formula.
    
    STEPS:
    1. Sum individual chemical risk scores (Low=10, Moderate=40, High=80)
    2. Add additive density factor based on count
    3. Add nutrition impact scores (STEP 2: Higher weights)
    4. Add automatic sugar escalation for >= 25g (STEP 6)
    5. Normalize to 0-100
    6. Apply escalation rules (STEP 3)
    7. Determine risk level from score with combined formula (STEP 4 & 5)
    
    Risk Level Thresholds (STEP 5):
    - 0-39: Low Risk
    - 40-69: Moderate Risk
    - 70-100: High Risk
    """
    total_score = 0
    
    # STEP 1: Sum individual chemical risk scores
    chemical_score = 0
    for chem in detected_chemicals:
        risk_level = chem.get('risk_level', '').lower().strip()
        score = RISK_LEVEL_SCORES.get(risk_level, 0)
        chemical_score += score
    
    total_score += chemical_score
    
    # STEP 2: Add additive density factor
    num_additives = len(detected_chemicals)
    density_bonus = 0
    for (min_add, max_add), bonus in ADDITIVE_DENSITY_BONUS.items():
        if min_add <= num_additives <= max_add:
            total_score += bonus
            density_bonus = bonus
            break
    
    # STEP 2 & 3: Add nutrition impact with detection for added sugar
    nutrition_issues = []
    nutrition_bonus = 0
    high_nutrition_issues = []  # Track HIGH issues for escalation
    
    # Detect added sugar
    added_sugar_detected = False
    for pattern in ADDED_SUGAR_PATTERNS:
        if pattern.search(ingredient_text):
            added_sugar_detected = True
            break
    
    # Calculate added sugar value
    if added_sugar_detected and nutrition_values.get('sugar'):
        nutrition_values['added_sugar'] = nutrition_values['sugar'] * 0.8
    
    # Check for HIGH sugar first (>= 25g)
    sugar_value = nutrition_values.get('sugar')
    if sugar_value is not None:
        if sugar_value >= NUTRITION_DETECTION_THRESHOLDS.get('sugar', 25):
            # High sugar
            total_score += NUTRITION_IMPACT_SCORES.get('sugar', 35)
            nutrition_bonus += NUTRITION_IMPACT_SCORES.get('sugar', 35)
            nutrition_issues.append('Sugar (High)')
            high_nutrition_issues.append('sugar')
        elif sugar_value >= NUTRITION_DETECTION_THRESHOLDS.get('sugar_moderate', 10):
            # Moderate sugar - add points but don't mark as HIGH issue
            total_score += NUTRITION_IMPACT_SCORES.get('sugar_moderate', 20)
            nutrition_bonus += NUTRITION_IMPACT_SCORES.get('sugar_moderate', 20)
            nutrition_issues.append('Sugar (Moderate)')
    
    # Check for other nutrients
    for nutrient, bonus_score in NUTRITION_IMPACT_SCORES.items():
        # Skip sugar as we handled it above
        if nutrient in ['sugar', 'sugar_moderate']:
            continue
        threshold = NUTRITION_DETECTION_THRESHOLDS.get(nutrient, 0)
        value = nutrition_values.get(nutrient)
        if value is not None and value >= threshold:
            total_score += bonus_score
            nutrition_bonus += bonus_score
            # Store with underscore to space conversion for display
            display_name = nutrient.replace('_', ' ').title()
            nutrition_issues.append(display_name)
            high_nutrition_issues.append(nutrient)
    
    # STEP 6: Ensure sugar >= 25g is treated seriously - auto add 30 points
    # This ensures high sugar foods cannot be classified as LOW risk
    sugar_value = nutrition_values.get('sugar')
    sugar_escalation = 0
    if sugar_value is not None and sugar_value >= 25:
        sugar_escalation = 30
        total_score += sugar_escalation
    
    # Additional escalation for moderate sugar (10-24g) to ensure at least MODERATE risk
    # This ensures foods with moderate sugar are not classified as LOW risk
    if sugar_value is not None and 10 <= sugar_value < 25:
        # Add extra points to ensure moderate sugar leads to at least MODERATE
        total_score += 20  # Bring score to at least 40
        sugar_escalation = 20
    processing_risk = min(num_additives * 3, 30)  # Cap at 30
    
    # Normalize and calculate component scores for combined formula
    # STEP 4: Weighted formula
    # chemical_risk * 0.35 + nutrition_risk * 0.35 + sugar_risk * 0.20 + processing_risk * 0.10
    chemical_component = min(chemical_score, 100) * 0.35
    nutrition_component = min(nutrition_bonus * 2, 100) * 0.35  # Scale up nutrition
    sugar_component = min((sugar_value or 0) * 2, 100) * 0.20 if sugar_value else 0
    processing_component = processing_risk * 0.10
    
    # Use the higher of total_score or weighted formula
    weighted_score = chemical_component + nutrition_component + sugar_component + processing_component
    final_score = max(min(100, total_score), min(100, int(weighted_score)))
    
    # STEP 3: Apply escalation rules
    # If any HIGH nutrition issue exists, overall risk must be at least MODERATE
    # If multiple HIGH nutrition issues exist, overall risk must be HIGH
    
    # Determine initial risk level
    if final_score >= 70:
        preliminary_level = 'High'
    elif final_score >= 40:
        preliminary_level = 'Moderate'
    else:
        preliminary_level = 'Low'
    
    # STEP 3: Escalation rules based on HIGH nutrition issues
    high_nutrient_count = len(high_nutrition_issues)
    
    if high_nutrient_count >= 2:
        # Multiple HIGH nutrition issues → HIGH
        final_risk_level = 'High'
        final_score = max(final_score, 70)  # Ensure at least 70
    elif high_nutrient_count == 1 and preliminary_level == 'Low':
        # One HIGH nutrition issue but LOW → escalate to MODERATE
        final_risk_level = 'Moderate'
        final_score = max(final_score, 40)  # Ensure at least 40
    elif high_nutrient_count >= 1 and preliminary_level in ['Low', 'Moderate']:
        # HIGH nutrition issue exists → ensure at least MODERATE
        final_risk_level = 'Moderate'
        final_score = max(final_score, 40)
    else:
        final_risk_level = preliminary_level
    
    # Final cap at 100
    final_score = min(100, final_score)
    
    return {
        'risk_score': final_score,
        'risk_level': final_risk_level,
        'total_additives': num_additives,
        'nutrition_issues': nutrition_issues,
        'high_nutrition_issues': high_nutrition_issues,
        'chemical_score': chemical_score,
        'density_bonus': density_bonus,
        'nutrition_bonus': nutrition_bonus,
        'sugar_escalation': sugar_escalation,
        'processing_risk': processing_risk,
        'weighted_components': {
            'chemical': chemical_component,
            'nutrition': nutrition_component,
            'sugar': sugar_component,
            'processing': processing_component
        }
    }


def calculate_priority_based_risk(detected_chemicals: List[Dict]) -> Dict[str, Any]:
    """
    Calculate risk using priority logic:
    - If ANY high-risk chemical exists → HIGH
    - Else if 2+ moderate chemicals → MODERATE
    - Else if only low/minimal chemicals → LOW
    - Else → LOW (no chemicals detected)
    
    DEPRECATED: Use calculate_comprehensive_risk_score instead.
    """
    if not detected_chemicals:
        return {
            'risk_level': 'Low',
            'risk_score': 0,
            'high_count': 0,
            'moderate_count': 0,
            'low_count': 0
        }
    
    high_count = 0
    moderate_count = 0
    low_count = 0
    
    for chem in detected_chemicals:
        risk = chem.get('risk_level', '').lower()
        if risk == 'high':
            high_count += 1
        elif risk == 'moderate':
            moderate_count += 1
        else:  # low or minimal
            low_count += 1
    
    # Priority logic
    if high_count > 0:
        risk_level = 'High'
    elif moderate_count >= 2:
        risk_level = 'Moderate'
    else:
        risk_level = 'Low'
    
    return {
        'risk_level': risk_level,
        'high_count': high_count,
        'moderate_count': moderate_count,
        'low_count': low_count
    }


# Nutrition thresholds for extreme values - REVISED
NUTRITION_THRESHOLDS = {
    'sodium': {'extreme': 2000, 'high': 800, 'moderate': 400},  # mg
    'sugar': {'extreme': 50, 'high': 25, 'moderate': 10},  # g - revised for stricter detection
    'added_sugar': {'extreme': 30, 'high': 15, 'moderate': 5},  # g - NEW
    'saturated_fat': {'extreme': 15, 'high': 5, 'moderate': 2},  # g
    'trans_fat': {'extreme': 2, 'high': 1, 'moderate': 0.5}  # g
}

# Added sugar patterns for detection
ADDED_SUGAR_PATTERNS = [
    re.compile(r'(?:added|sweetener|syrup|molasses|honey|high fructose corn syrup)', re.IGNORECASE),
    re.compile(r'(?:sucrose|glucose|fructose|dextrose|maltose|lactose)', re.IGNORECASE),
]


def assess_nutrition_risk(nutrition_text: str, ingredient_text: str = "") -> Dict[str, Any]:
    """
    Assess nutrition risk from nutrition facts text.
    Returns nutrition issues and risk level adjustment.
    
    STEP 1: Ensures high sugar is detected correctly (>=25g = High)
    STEP 1: Added detection for added sugar.
    """
    issues = []
    extreme_count = 0
    high_count = 0
    high_nutrition_issues = []  # Track HIGH level issues for escalation
    
    # Extract values
    values = extract_nutrition_values(nutrition_text)
    
    # Detect added sugar from ingredient text
    added_sugar_detected = False
    for pattern in ADDED_SUGAR_PATTERNS:
        if pattern.search(ingredient_text):
            added_sugar_detected = True
            break
    
    # If added sugar keywords found, estimate from total sugar
    if added_sugar_detected and values.get('sugar'):
        # Assume at least 80% of sugar is added sugar if keywords detected
        values['added_sugar'] = values['sugar'] * 0.8
    else:
        values['added_sugar'] = None
    
    for nutrient, thresholds in NUTRITION_THRESHOLDS.items():
        value = values.get(nutrient)
        if value is not None:
            if value >= thresholds['extreme']:
                issues.append(f"Extreme {nutrient} content: {value}")
                extreme_count += 1
                high_count += 1
                high_nutrition_issues.append(nutrient)
            elif value >= thresholds['high']:
                issues.append(f"High {nutrient} content: {value}")
                high_count += 1
                high_nutrition_issues.append(nutrient)
            elif value >= thresholds['moderate']:
                issues.append(f"Moderate {nutrient} content: {value}")
    
    # Determine if nutrition should increase risk
    # Extreme nutrition increases risk, but doesn't override high chemical risk
    risk_increase = 'none'
    if extreme_count > 0:
        risk_increase = 'extreme'
    elif high_count > 0:
        risk_increase = 'high'
    
    return {
        'issues': issues,
        'risk_increase': risk_increase,
        'extreme_count': extreme_count,
        'high_count': high_count,
        'high_nutrition_issues': high_nutrition_issues,  # For escalation
        'values': values
    }


def calculate_risk_score(chemical_risk: Dict, nutrition_risk: Dict, detected_chemicals: List[Dict]) -> int:
    """
    Calculate numeric risk score (0-100).
    
    Factors:
    - Chemical risk (base score)
    - Number of additives
    - Nutrition issues
    - Processing level
    """
    score = 0
    
    # Base score from chemical risk level
    risk_level = chemical_risk.get('risk_level', 'Low')
    if risk_level == 'High':
        score += 50
    elif risk_level == 'Moderate':
        score += 25
    elif risk_level == 'Low':
        score += 10
    
    # Add points for number of chemicals
    num_chemicals = len(detected_chemicals)
    if num_chemicals > 0:
        score += min(num_chemicals * 5, 20)  # Cap at 20
    
    # Add points for high-risk chemicals
    high_count = chemical_risk.get('high_count', 0)
    moderate_count = chemical_risk.get('moderate_count', 0)
    
    score += high_count * 10  # Each high-risk chemical adds 10
    score += moderate_count * 3  # Each moderate chemical adds 3
    
    # Add points for nutrition issues
    nutrition_issues = nutrition_risk.get('issues', [])
    if nutrition_risk.get('risk_increase') == 'extreme':
        score += 20
    elif nutrition_risk.get('risk_increase') == 'high':
        score += 10
    
    # Cap at 100
    return min(score, 100)


def get_diseases_from_chemicals(detected_chemicals: List[Dict]) -> List[str]:
    """
    Extract health concerns from detected chemicals.
    Returns deduplicated list of diseases/health issues.
    """
    diseases = set()
    
    for chem in detected_chemicals:
        concerns = chem.get('health_concerns', '')
        if concerns:
            # Split by comma and clean up
            for concern in concerns.split(','):
                concern = concern.strip()
                if concern and len(concern) > 2:  # Filter out very short strings
                    diseases.add(concern)
    
    return sorted(list(diseases))


def generate_recommendation(risk_level: str, detected_chemicals: List[Dict], nutrition_issues: List[str]) -> str:
    """Generate a recommendation based on the analysis."""
    if risk_level == 'High':
        high_risk_chemicals = [c['chemical_name'] for c in detected_chemicals 
                              if c.get('risk_level', '').lower() == 'high']
        if high_risk_chemicals:
            return f"⚠️ HIGH RISK: This product contains high-risk additives ({', '.join(high_risk_chemicals[:3])}). Consider avoiding or limiting consumption."
        return "⚠️ HIGH RISK: This product has significant health concerns. Consider reducing consumption."
    
    elif risk_level == 'Moderate':
        return "⚠️ MODERATE RISK: This product contains some additives that may be a concern for frequent consumption. Monitor your intake."
    
    elif risk_level == 'Low':
        if detected_chemicals:
            return "✅ LOW RISK: This product appears safe for occasional consumption with minor additives."
        return "✅ LOW RISK: No significant additives detected. This appears to be a safer choice."
    
    return "✅ This product appears to be a safe choice."


def generate_risk_summary(risk_score: Any) -> str:
    """Generate a concise AI-style summary from risk score."""
    try:
        score = float(risk_score)
    except (TypeError, ValueError):
        score = 0.0

    if score > 70:
        return "High-risk product with harmful additives. Avoid frequent consumption."
    if score > 40:
        return "Moderate risk. Consume occasionally."
    return "Low-risk product. Generally safe."


def generate_simplified_ingredient_summary(ingredient_text: str, detected_chemicals: List[Dict]) -> str:
    """
    Convert raw ingredient signals into a simple human-readable summary.
    Always returns a string.
    """
    try:
        text = str(ingredient_text or "").lower()
        chem_names = " ".join(
            str(item.get("chemical_name", "")).lower()
            for item in (detected_chemicals or [])
            if isinstance(item, dict)
        )
        combined = f"{text} {chem_names}".strip()

        has_added_sugars = any(
            marker in combined
            for marker in [
                "sugar", "syrup", "high fructose corn syrup", "glucose",
                "dextrose", "maltose", "fructose"
            ]
        )
        has_preservatives = any(
            marker in combined
            for marker in [
                "preservative", "benzoate", "nitrite", "nitrate", "sorbate",
                "bha", "bht", "tbhq", "sodium benzoate", "potassium benzoate"
            ]
        )
        has_artificial_flavors = any(
            marker in combined
            for marker in [
                "artificial flavor", "artificial flavours", "natural flavor",
                "flavoring", "flavours", "flavors", "colour", "color added"
            ]
        )
        has_artificial_sweeteners = any(
            marker in combined
            for marker in ["aspartame", "sucralose", "saccharin", "acesulfame", "sweetener"]
        )

        parts: List[str] = []
        if has_added_sugars:
            parts.append("added sugars")
        if has_preservatives:
            parts.append("preservatives")
        if has_artificial_flavors:
            parts.append("artificial flavors")
        if has_artificial_sweeteners:
            parts.append("artificial sweeteners")

        if not parts:
            return "This product appears to have a relatively simple ingredient profile."
        if len(parts) == 1:
            return f"This product contains {parts[0]}."
        if len(parts) == 2:
            return f"This product contains {parts[0]} and {parts[1]}."
        return f"This product contains {', '.join(parts[:-1])}, and {parts[-1]}."
    except Exception:
        return "No data available"


def calculate_processing_complexity(detected_chemicals: List[Dict]) -> int:
    """
    Calculate processing complexity score from detected chemicals count.
    complexity = len(detected_chemicals) * 10, clamped to 100.
    """
    count = len(detected_chemicals) if isinstance(detected_chemicals, list) else 0
    return max(0, min(100, count * 10))


ALTERNATIVE_SUGGESTION_MAP: Dict[str, str] = {
    "cola": "coconut water",
    "chips": "roasted snacks",
    "processed food": "fresh fruits",
}

# Food pairing suggestions - maps unhealthy items to healthier alternatives
PAIRING_SUGGESTIONS_MAP: Dict[str, str] = {
    # Beverages
    "cola": "pair with water or coconut water",
    "soda": "pair with sparkling water with lemon",
    "energy drink": "pair with green tea",
    "iced tea": "pair with fresh fruit-infused water",
    "fruit juice": "pair with whole fruit",
    "lemonade": "pair with plain water",
    
    # Snacks
    "chips": "pair with fresh salad",
    "potato chips": "pair with roasted chickpeas",
    "fried snacks": "pair with air-popped popcorn",
    "cookies": "pair with fresh fruits",
    "candy": "pair with dark chocolate (70%+)",
    "chocolate bar": "pair with nuts",
    
    # Processed foods
    "instant noodles": "pair with vegetable soup",
    "frozen pizza": "pair with grilled vegetables",
    "frozen meals": "pair with fresh salad",
    "canned soup": "pair with homemade broth",
    
    # Sugars & Sweets
    "sugar": "pair with fresh fruits",
    "high fructose corn syrup": "pair with honey (in moderation)",
    "artificial sweetener": "pair with natural sweeteners",
    "syrup": "pair with fresh berries",
    
    # Dairy
    "ice cream": "pair with fresh fruit salad",
    "flavored yogurt": "pair with plain yogurt with fruits",
    
    # Fast food
    "burger": "pair with grilled chicken salad",
    "fries": "pair with baked sweet potato",
    "pizza": "pair with vegetable stir-fry",
    "hot dog": "pair with grilled chicken",
    
    # Others
    "bread": "pair with fresh vegetables",
    "white bread": "pair with whole grain bread",
    "cereal": "pair with fresh berries",
    "granola": "pair with fresh fruits",
}


def generate_alternative_suggestions(ingredient_text: str, risk_score: Any) -> List[str]:
    """
    Return alternative food suggestions when risk score is high enough.
    """
    try:
        score = float(risk_score)
    except (TypeError, ValueError):
        score = 0.0

    if score <= 50:
        return []

    text = (ingredient_text or "").lower()
    suggestions: List[str] = []
    for source_term, suggestion in ALTERNATIVE_SUGGESTION_MAP.items():
        if source_term in text and suggestion not in suggestions:
            suggestions.append(suggestion)

    return suggestions


def generate_pairing_suggestions(ingredient_text: str, detected_chemicals: List[Any], risk_score: Any) -> List[Dict[str, str]]:
    """
    Generate pairing suggestions for unhealthy items found in the food.
    Returns a list of dictionaries with 'item' and 'suggestion' keys.
    """
    try:
        score = float(risk_score)
    except (TypeError, ValueError):
        score = 0.0
    
    # Only suggest pairings for moderate to high risk foods
    if score < 30:
        return []
    
    text = (ingredient_text or "").lower()
    
    # Also check detected chemicals
    chemical_text = ""
    if isinstance(detected_chemicals, list):
        for chem in detected_chemicals:
            if isinstance(chem, dict):
                chemical_text += " " + (chem.get("chemical_name", "") or "")
            elif isinstance(chem, str):
                chemical_text += " " + chem
    
    combined_text = text + " " + chemical_text.lower()
    
    pairing_suggestions: List[Dict[str, str]] = []
    seen_items = set()
    
    for unhealthy_item, suggestion in PAIRING_SUGGESTIONS_MAP.items():
        if unhealthy_item in combined_text and unhealthy_item not in seen_items:
            pairing_suggestions.append({
                "item": unhealthy_item,
                "suggestion": suggestion
            })
            seen_items.add(unhealthy_item)
    
    return pairing_suggestions


DEFAULT_RECOMMENDED_MEALS: List[str] = [
    "Oats with fruits",
    "Grilled paneer",
    "Salad bowl",
]

MAX_GROCERY_ITEMS = 40
MAX_GROCERY_ITEM_LENGTH = 600


def generate_recommended_meals(health_mode: Optional[str]) -> List[str]:
    """
    Suggest meals based on user health profile.
    Supports aliases like: diabetes, heart/heart_disease, fitness.
    Always returns fallback meals when no profile match is found.
    """
    normalized = str(health_mode or "").strip().lower()
    if normalized in ["heart_disease", "cardiac", "heart"]:
        normalized = "heart"

    if normalized == "diabetes":
        meals = [
            "Oats with chia seeds",
            "Moong dal chilla",
            "Vegetable salad bowl",
        ]
    elif normalized == "fitness":
        meals = [
            "Grilled paneer with quinoa",
            "Boiled eggs with sauteed veggies",
            "Greek yogurt with nuts",
        ]
    elif normalized == "heart":
        meals = [
            "Steamed vegetables with brown rice",
            "Mixed lentil soup",
            "Low-sodium salad bowl",
        ]
    else:
        meals = DEFAULT_RECOMMENDED_MEALS.copy()

    safe_meals = [str(item).strip() for item in meals if str(item).strip()]
    return safe_meals if safe_meals else DEFAULT_RECOMMENDED_MEALS.copy()


def analyze_grocery_items(items: List[str], health_condition: Optional[str] = None) -> Dict[str, Any]:
    """
    Analyze a full grocery list by analyzing each item individually.
    Large input is handled safely by capping count and per-item text length.
    """
    fallback = {
        "total_items": 0,
        "high_risk_count": 0,
        "safe_items": [],
        "overall_grocery_score": 0,
        "item_results": [],
    }

    try:
        if not isinstance(items, list):
            return fallback

        sanitized_items: List[str] = []
        for raw in items[:MAX_GROCERY_ITEMS]:
            clean = str(raw or "").strip()
            if not clean:
                continue
            clean = clean[:MAX_GROCERY_ITEM_LENGTH]
            sanitized_items.append(clean)

        if not sanitized_items:
            return fallback

        item_results: List[Dict[str, Any]] = []
        high_risk_count = 0
        safe_items: List[str] = []
        risk_total = 0

        for item in sanitized_items:
            try:
                analysis = analyze_food_comprehensive(
                    ingredient_text=item,
                    nutrition_text="",
                    health_condition=health_condition
                )
                risk_score = max(0, min(100, int(float(analysis.get("risk_score", 0) or 0))))
                risk_level = str(analysis.get("risk_level", "Low") or "Low")
            except Exception:
                risk_score = 0
                risk_level = "Low"

            risk_total += risk_score
            if risk_score > 70 or risk_level.lower() == "high":
                high_risk_count += 1
            if risk_score <= 40:
                safe_items.append(item)

            item_results.append({
                "item": item,
                "risk_score": risk_score,
                "risk_level": risk_level
            })

        total_items = len(sanitized_items)
        average_risk = (risk_total / total_items) if total_items else 100
        overall_grocery_score = int(max(0, min(100, round(100 - average_risk))))

        return {
            "total_items": total_items,
            "high_risk_count": high_risk_count,
            "safe_items": safe_items,
            "overall_grocery_score": overall_grocery_score,
            "item_results": item_results,
        }
    except Exception:
        return fallback


TOXICITY_LONG_TERM_MAP: Dict[str, str] = {
    "sugar": "Long-term diabetes risk",
    "trans fat": "Heart disease risk",
    "sodium": "Blood pressure risk",
}


def generate_toxicity_timeline(
    ingredient_text: str,
    nutrition_values: Dict[str, float],
    nutrition_issues: List[str]
) -> List[str]:
    """
    Build a toxicity timeline from detected nutrition/ingredient signals.
    Returns [] when no meaningful source data is available.
    """
    has_sources = bool((ingredient_text or "").strip()) or bool(nutrition_values) or bool(nutrition_issues)
    if not has_sources:
        return []

    ingredient_blob = (ingredient_text or "").lower()
    issues_blob = " ".join([str(item).lower() for item in (nutrition_issues or [])])
    long_term_effects: List[str] = []

    for marker, effect in TOXICITY_LONG_TERM_MAP.items():
        marker_key = marker.lower().strip()
        marker_nutrition_key = marker_key.replace(" ", "_")
        value = nutrition_values.get(marker_nutrition_key)
        matched = False

        if marker_key in ingredient_blob or marker_key in issues_blob:
            matched = True
        elif value is not None:
            try:
                matched = float(value) > 0
            except (TypeError, ValueError):
                matched = False

        if matched and effect not in long_term_effects:
            long_term_effects.append(effect)

    long_term_text = ", ".join(long_term_effects) if long_term_effects else "disease risk"
    return [
        "Short-term: minimal effect",
        "Mid-term: metabolic changes",
        f"Long-term: {long_term_text}",
    ]


MAX_PARSED_INGREDIENT_TEXT_LENGTH = 5000
MAX_PARSED_INGREDIENT_ITEMS = 300


def parse_ingredients_for_ai(ingredient_text: str) -> List[str]:
    """
    Parse ingredient text into normalized items with size limits for safety.
    """
    bounded_text = str(ingredient_text or "")[:MAX_PARSED_INGREDIENT_TEXT_LENGTH]
    parts = re.split(r"[,;\n\r]+", bounded_text)
    parsed: List[str] = []
    for part in parts:
        clean = part.strip()
        if clean and len(clean) <= 120:
            parsed.append(clean)
        if len(parsed) >= MAX_PARSED_INGREDIENT_ITEMS:
            break
    return parsed


def build_ai_nutrition_fields(
    ingredient_text: str,
    detected_chemicals: List[Dict],
    risk_score: Any
) -> Dict[str, Any]:
    """
    Build AI-assistant response fields with strict fallbacks and no nulls.
    """
    defaults: Dict[str, Any] = {
        "food_score": 0,
        "confidence": 0,
        "summary": "No data available",
        "decision": "Safe to eat",
        "complexity_score": 0,
        "hidden_ingredients": [],
        "timeline": [],
        "impact": "Minimal long-term impact",
        "recommendations": [],
        "deficiencies": [],
        "category": "Healthy",
        "simplified": "No data available",
        "simplified_summary": "No data available",
        "parsed_ingredients": [],
    }

    try:
        parsed_ingredients = parse_ingredients_for_ai(ingredient_text)
        detected_count = len(detected_chemicals) if isinstance(detected_chemicals, list) else 0
        safe_risk_score = max(0, min(100, int(float(risk_score or 0))))

        food_score = max(0, 100 - safe_risk_score)
        confidence = int((detected_count / max(1, len(parsed_ingredients))) * 100)
        confidence = max(0, min(100, confidence))

        if safe_risk_score > 70:
            summary = "High-risk product with harmful additives. Avoid frequent consumption."
            decision = "No, avoid"
            impact = "Frequent consumption may lead to obesity, diabetes, or heart disease"
            category = "Junk"
        elif safe_risk_score > 40:
            summary = "Moderate risk. Consume occasionally."
            decision = "Eat occasionally"
            impact = "Moderate long-term health impact"
            category = "Processed"
        else:
            summary = "Low-risk product. Generally safe."
            decision = "Safe to eat"
            impact = "Minimal long-term impact"
            category = "Healthy"

        complexity_score = min(100, detected_count * 10)

        aliases = {
            "dextrose": "sugar",
            "maltose": "sugar",
            "e621": "msg",
            "aspartame": "artificial sweetener",
        }

        hidden_ingredients: List[Dict[str, str]] = []
        for ing in parsed_ingredients:
            key = ing.lower()
            if key in aliases:
                hidden_ingredients.append({
                    "original": ing,
                    "actual": aliases[key]
                })

        timeline = [
            "Short-term: minimal effect",
            "Mid-term: metabolic changes",
            "Long-term: disease risk"
        ]

        recommendations = [
            "Choose fresh foods",
            "Avoid processed items",
            "Check labels before buying"
        ]

        parsed_blob = str(parsed_ingredients).lower()
        deficiencies: List[str] = []

        protein_markers = [
            "protein", "egg", "paneer", "tofu", "lentil", "dal", "bean",
            "chickpea", "soy", "milk", "yogurt", "curd", "nuts", "seeds",
            "fish", "chicken", "meat"
        ]
        fruit_markers = [
            "fruit", "fruits", "apple", "banana", "orange", "mango", "papaya",
            "grape", "berries", "berry", "pineapple", "guava", "melon",
            "pear", "peach", "pomegranate"
        ]
        fiber_markers = [
            "fiber", "fibre", "whole grain", "oats", "bran", "vegetable",
            "veggie", "fruit", "fruits", "bean", "lentil", "dal", "chickpea",
            "seed", "seeds"
        ]

        has_protein_source = any(marker in parsed_blob for marker in protein_markers)
        has_fruit_source = any(marker in parsed_blob for marker in fruit_markers)
        has_fiber_source = any(marker in parsed_blob for marker in fiber_markers)

        if not has_protein_source:
            deficiencies.append("Low protein intake")
        if not has_fruit_source:
            deficiencies.append("Low vitamin intake")
        if not has_fiber_source:
            deficiencies.append("Low fiber intake")

        simplified_summary = generate_simplified_ingredient_summary(
            ingredient_text=ingredient_text,
            detected_chemicals=detected_chemicals,
        )
        simplified = simplified_summary

        return {
            "food_score": food_score,
            "confidence": confidence,
            "summary": summary,
            "decision": decision,
            "complexity_score": complexity_score,
            "hidden_ingredients": hidden_ingredients,
            "timeline": timeline,
            "impact": impact,
            "recommendations": recommendations,
            "deficiencies": deficiencies,
            "category": category,
            "simplified": simplified,
            "simplified_summary": simplified_summary,
            "parsed_ingredients": parsed_ingredients,
        }
    except Exception:
        return defaults


def analyze_food_comprehensive(ingredient_text: str, nutrition_text: str = "", 
                        health_condition: str = None) -> Dict[str, Any]:
    """
    Comprehensive food analysis using database-driven detection.
    Returns structured analysis with risk level, score, detected chemicals, etc.
    
    Uses the new comprehensive scoring system:
    - Chemical scores: Low=10, Moderate=40, High=80
    - Additive density: 1-2:+5, 3-5:+15, 6+:+30
    - Nutrition impact: High sugar +35, High sodium +20, High sat fat +20, Trans fat +40
    - Sugar escalation: +30 for sugar >= 25g
    - Risk levels: Low 0-39, Moderate 40-69, High 70-100
    - Escalation: HIGH nutrition issue → at least MODERATE, multiple HIGH → HIGH
    
    Now includes:
    - FEATURE 1: AI Ingredient Explanations
    - FEATURE 3: Personal Health Mode Warnings
    - FEATURE 4: Processing Level Detection (NOVA)
    - FEATURE 5: Additive Interaction Warnings
    """
    # Step 1: Detect ALL chemicals from ingredients (STEP 2)
    detected_chemicals = detect_chemicals_from_ingredients(ingredient_text)
    
    # FEATURE 1: Add explanations to each detected chemical
    for chem in detected_chemicals:
        chem['explanation'] = generate_explanation(chem)
    
    # Step 2: Extract nutrition values
    nutrition_values = extract_nutrition_values(nutrition_text)
    
    # Step 3-7: Calculate comprehensive risk score using new formula
    # Pass ingredient_text for added sugar detection
    risk_result = calculate_comprehensive_risk_score(detected_chemicals, nutrition_values, ingredient_text)
    
    # Step 8: Get diseases from chemicals (health concerns)
    diseases = get_diseases_from_chemicals(detected_chemicals)
    
    # Generate recommendation based on new risk level
    recommendation = generate_recommendation(
        risk_result['risk_level'], 
        detected_chemicals, 
        risk_result['nutrition_issues']
    )
    
    # FEATURE 4: Calculate processing level (NOVA classification)
    processing_level = get_processing_level(
        risk_result['total_additives'], 
        risk_result['nutrition_issues']
    )
    
    # FEATURE 3: Get health warnings based on user's health condition
    health_warnings = get_health_warnings(
        health_condition, 
        ingredient_text, 
        detected_chemicals, 
        nutrition_values
    ) if health_condition else []
    
    # FEATURE 5: Detect additive interactions
    additive_interactions = detect_additive_interactions(ingredient_text, detected_chemicals)

    # AI assistant enhancement fields with safe defaults.
    ai_fields = build_ai_nutrition_fields(
        ingredient_text=ingredient_text,
        detected_chemicals=detected_chemicals,
        risk_score=risk_result['risk_score']
    )
    
    # Build response with all required fields (STEP 9)
    # Feature 1: Food Safety Score (0-100)
    safety_score = max(0, 100 - risk_result['risk_score'])
    summary = ai_fields.get('summary', generate_risk_summary(risk_result['risk_score']))
    complexity_score = ai_fields.get('complexity_score', calculate_processing_complexity(detected_chemicals))
    suggestions = generate_alternative_suggestions(ingredient_text, risk_result['risk_score'])
    pairing_suggestions = generate_pairing_suggestions(ingredient_text, detected_chemicals, risk_result['risk_score'])
    timeline = ai_fields.get('timeline', [])
    recommended_meals = generate_recommended_meals(health_condition)
    
    return {
        'risk_score': risk_result['risk_score'],
        'risk_level': risk_result['risk_level'],
        'food_score': ai_fields.get('food_score', safety_score),
        'confidence': ai_fields.get('confidence', 0),
        'summary': summary,
        'decision': ai_fields.get('decision', 'Safe to eat'),
        'complexity_score': complexity_score,
        'suggestions': suggestions,
        'pairing_suggestions': pairing_suggestions,
        'timeline': timeline,
        'impact': ai_fields.get('impact', 'Minimal long-term impact'),
        'recommendations': ai_fields.get('recommendations', []),
        'recommended_meals': recommended_meals,
        'deficiencies': ai_fields.get('deficiencies', []),
        'category': ai_fields.get('category', 'Healthy'),
        'simplified': ai_fields.get('simplified', 'No data available'),
        'simplified_summary': ai_fields.get('simplified_summary', ai_fields.get('simplified', 'No data available')),
        'parsed_ingredients': ai_fields.get('parsed_ingredients', []),
        'food_safety_score': safety_score,
        'detected_chemicals': detected_chemicals,
        'hidden_ingredients': ai_fields.get('hidden_ingredients', []),
        'total_additives': risk_result['total_additives'],  # STEP 9: Add total_additives
        'diseases': diseases,
        'nutrition_issues': risk_result['nutrition_issues'],
        'recommendation': recommendation,
        'chemical_summary': {
            'chemical_score': risk_result['chemical_score'],
            'density_bonus': risk_result['density_bonus'],
            'nutrition_bonus': risk_result['nutrition_bonus'],
            'total_count': len(detected_chemicals)
        },
        'nutrition_summary': {
            'values': nutrition_values,
            'issues_count': len(risk_result['nutrition_issues'])
        },
        # NEW: Feature 1 - Ingredient Explanations
        'ingredient_explanations': [generate_explanation(chem) for chem in detected_chemicals],
        # NEW: Feature 4 - Processing Level
        'processing_level': processing_level,
        # NEW: Feature 3 - Health Mode Warnings
        'health_warnings': health_warnings,
        'health_condition': health_condition,
        # NEW: Feature 5 - Additive Interactions
        'additive_interactions': additive_interactions
    }

# Ingredient detection keywords
INGREDIENT_KEYWORDS = {
    # Artificial sweeteners
    "aspartame": ["aspartame"],
    "sucralose": ["sucralose"],
    "saccharin": ["saccharin"],
    "acesulfame potassium": ["acesulfame potassium", "acesulfame k", "ace-k"],
    "stevia": ["stevia", "stevia extract", "rebiana", "steviol glycosides"],
    "sugar alcohols": ["sorbitol", "maltitol", "xylitol", "erythritol", "mannitol", "lactitol", "isomalt"],
    
    # Preservatives
    "sodium benzoate": ["sodium benzoate"],
    "potassium benzoate": ["potassium benzoate"],
    "sodium nitrite": ["sodium nitrite"],
    "sodium nitrate": ["sodium nitrate"],
    "BHA": ["BHA", "butylated hydroxyanisole"],
    "BHT": ["BHT", "butylated hydroxytoluene"],
    "TBHQ": ["TBHQ", "tert-butylhydroquinone"],
    "sodium metabisulfite": ["sodium metabisulfite"],
    "sulfur dioxide": ["sulfur dioxide", "sulphur dioxide"],
    "parabens": ["methylparaben", "ethylparaben", "propylparaben", "butylparaben"],
    
    # Food additives
    "monosodium glutamate": ["monosodium glutamate", "MSG", "glutamate"],
    "phosphoric acid": ["phosphoric acid"],
    "carrageenan": ["carrageenan"],
    "artificial colors": ["allura red", "tartrazine", "sunset yellow", "caramel color", "fd&c red", "fd&c yellow", "fd&c blue"],
    "titanium dioxide": ["titanium dioxide"],
    
    # High-risk ingredients
    "high fructose corn syrup": ["high fructose corn syrup", "hfcs", "corn syrup"],
    "hydrogenated oil": ["hydrogenated", "partially hydrogenated"],
    "artificial flavor": ["artificial flavor", "artificial flavoring"],
    "modified food starch": ["modified food starch", "modified corn starch", "modified tapioca starch"],
}

# ============================================================================
# FEATURE 3: PERSONAL HEALTH MODE - Health Rules Mapping
# ============================================================================
HEALTH_RULES = {
    "diabetes": [
        "sugar", "high fructose corn syrup", "corn syrup", "glucose",
        "fructose", "sucrose", "maltose", "dextrose", "lactose",
        "aspartame", "saccharin", "sucralose", "acesulfame",
        "honey", "maple syrup", "agave", "molasses"
    ],
    "hypertension": [
        "sodium", "sodium benzoate", "sodium nitrite", "sodium nitrate",
        "sodium metabisulfite", "sodium chloride", "monosodium glutamate",
        "msg", "disodium", "trisodium"
    ],
    "heart_disease": [
        "trans fat", "hydrogenated oil", "partially hydrogenated",
        "saturated fat", "palm oil", "coconut oil", "butter",
        "cholesterol", "lard", "tallow"
    ],
    "kidney_disease": [
        "phosphorus", "phosphate", "sodium", "potassium",
        "calcium", "magnesium", "nitrite", "nitrate"
    ],
    "obesity": [
        "sugar", "corn syrup", "high fructose corn syrup", "trans fat",
        "hydrogenated oil", "maltodextrin", "fructose", "glucose syrup"
    ],
    "fatty_liver": [
        "high fructose corn syrup", "fructose", "corn syrup", "sugar",
        "maltose", "dextrose", "glucose syrup"
    ],
    "pcos": [
        "sugar", "high fructose corn syrup", "corn syrup", "maltodextrin",
        "artificial sweetener", "dextrose", "sucrose"
    ],
    "thyroid_disorder": [
        "soy protein isolate", "soy lecithin", "iodized salt", "nitrate",
        "nitrite", "artificial color", "brominated"
    ],
    "digestive_disorder": [
        "carrageenan", "sorbitol", "maltitol", "xylitol", "mannitol",
        "sucralose", "aspartame", "artificial flavor"
    ],
    "pregnancy": [
        "caffeine", "saccharin", "aspartame", "sodium nitrate",
        "sodium nitrite", "alcohol", "unpasteurized"
    ],
}

# Health condition display names
HEALTH_CONDITION_NAMES = {
    "diabetes": "Diabetes",
    "hypertension": "Hypertension",
    "heart_disease": "Heart Disease",
    "kidney_disease": "Kidney Disease",
    "obesity": "Obesity",
    "fatty_liver": "Fatty Liver",
    "pcos": "PCOS",
    "thyroid_disorder": "Thyroid Disorder",
    "digestive_disorder": "Digestive Disorder",
    "pregnancy": "Pregnancy",
}


# ============================================================================
# FEATURE 5: SMART ADDITIVE INTERACTION WARNINGS
# ============================================================================
INTERACTION_RULES = [
    {
        "combo": ["sodium benzoate", "vitamin c", "ascorbic acid"],
        "warning": "May form benzene under certain conditions (heat/light exposure)",
        "severity": "moderate"
    },
    {
        "combo": ["aspartame", "phenylalanine"],
        "warning": "Unsafe for people with PKU (Phenylketonuria)",
        "severity": "high"
    },
    {
        "combo": ["sodium nitrite", "amine"],
        "warning": "May form nitrosamines (potential carcinogens) when heated",
        "severity": "high"
    },
    {
        "combo": ["BHA", "BHT"],
        "warning": "Multiple antioxidants may have combined health effects",
        "severity": "low"
    },
    {
        "combo": ["sodium nitrate", "sodium nitrite"],
        "warning": "Both preservatives may increase cancer risk when consumed regularly",
        "severity": "high"
    },
    {
        "combo": ["monosodium glutamate", "glutamate"],
        "warning": "May cause MSG symptom complex in sensitive individuals (headaches, nausea)",
        "severity": "low"
    },
    {
        "combo": ["carrageenan", " carrageenan"],
        "warning": "May cause digestive issues in sensitive individuals",
        "severity": "low"
    },
    {
        "combo": ["titanium dioxide", "nano"],
        "warning": "May have inflammatory effects in the gut",
        "severity": "moderate"
    }
]


def generate_explanation(chemical: Dict[str, Any]) -> str:
    """
    FEATURE 1: Generate AI-style explanation for a detected chemical.
    """
    name = chemical.get('chemical_name', 'Unknown')
    purpose = chemical.get('purpose', 'Not specified')
    concerns = chemical.get('health_concerns', 'No known concerns')
    risk = chemical.get('risk_level', 'Unknown')
    
    # Format the explanation
    explanation = f"""⚠ {name} detected

Purpose: {purpose}

Possible concerns:
{concerns}

Risk Level: {risk}"""
    
    return explanation


def get_processing_level(chemical_count: int, nutrition_issues: List[str]) -> str:
    """
    FEATURE 4: Classify food using NOVA system.
    
    - Ultra Processed: 6+ additives
    - Processed: 3-5 additives
    - Minimally Processed: 1-2 additives
    - Whole Food: 0 additives
    """
    if chemical_count >= 6:
        return "Ultra Processed"
    elif chemical_count >= 3:
        return "Processed"
    elif chemical_count >= 1:
        return "Minimally Processed"
    else:
        return "Whole Food"


def get_health_warnings(health_condition: str, ingredient_text: str, 
                       detected_chemicals: List[Dict], nutrition_values: Dict) -> List[Dict]:
    """
    FEATURE 3: Generate health-specific warnings based on user's health condition.
    """
    warnings = []
    
    if not health_condition or health_condition not in HEALTH_RULES:
        return warnings
    
    risk_ingredients = HEALTH_RULES.get(health_condition, [])
    ingredient_lower = ingredient_text.lower()
    
    # Check for matching risk ingredients
    for risk_item in risk_ingredients:
        if risk_item.lower() in ingredient_lower:
            warnings.append({
                "type": "health_condition",
                "condition": HEALTH_CONDITION_NAMES.get(health_condition, health_condition),
                "ingredient": risk_item,
                "message": f"⚠ {risk_item.title()} detected - Not recommended for {HEALTH_CONDITION_NAMES.get(health_condition, health_condition).lower()} patients."
            })
    
    # Check nutrition values for diabetes
    if health_condition == "diabetes":
        sugar = nutrition_values.get('sugar')
        if sugar and sugar > 10:
            warnings.append({
                "type": "nutrition",
                "condition": "Diabetes",
                "ingredient": "High Sugar",
                "message": f"⚠ High sugar content ({sugar}g) - Not recommended for diabetic users."
            })
    
    # Check sodium for hypertension
    if health_condition == "hypertension":
        sodium = nutrition_values.get('sodium')
        if sodium and sodium > 400:
            warnings.append({
                "type": "nutrition",
                "condition": "Hypertension",
                "ingredient": "High Sodium",
                "message": f"⚠ High sodium content ({sodium}mg) - Not recommended for hypertension patients."
            })
    
    # Check fats for heart disease
    if health_condition == "heart_disease":
        sat_fat = nutrition_values.get('saturated_fat')
        trans_fat = nutrition_values.get('trans_fat')
        if sat_fat and sat_fat > 4:
            warnings.append({
                "type": "nutrition",
                "condition": "Heart Disease",
                "ingredient": "High Saturated Fat",
                "message": f"Warning: High saturated fat ({sat_fat}g) - Not ideal for heart disease patients."
            })
        if trans_fat and trans_fat > 0.5:
            warnings.append({
                "type": "nutrition",
                "condition": "Heart Disease",
                "ingredient": "Trans Fat",
                "message": f"Warning: Trans fat detected ({trans_fat}g) - Should be avoided in heart disease."
            })

    # Check sodium/protein load for kidney disease
    if health_condition == "kidney_disease":
        sodium = nutrition_values.get('sodium')
        protein = nutrition_values.get('protein')
        if sodium and sodium > 300:
            warnings.append({
                "type": "nutrition",
                "condition": "Kidney Disease",
                "ingredient": "High Sodium",
                "message": f"Warning: High sodium content ({sodium}mg) - May stress kidney function."
            })
        if protein and protein > 20:
            warnings.append({
                "type": "nutrition",
                "condition": "Kidney Disease",
                "ingredient": "High Protein",
                "message": f"Warning: High protein load ({protein}g) - Consult renal diet guidance."
            })

    # Check sugar/calorie burden for obesity, fatty liver and PCOS
    if health_condition in ["obesity", "fatty_liver", "pcos"]:
        sugar = nutrition_values.get('sugar')
        calories = nutrition_values.get('calories')
        condition_name = HEALTH_CONDITION_NAMES.get(health_condition, health_condition)
        if sugar and sugar > 12:
            warnings.append({
                "type": "nutrition",
                "condition": condition_name,
                "ingredient": "High Sugar",
                "message": f"Warning: Elevated sugar ({sugar}g) - May worsen {condition_name.lower()} risk."
            })
        if health_condition == "obesity" and calories and calories > 250:
            warnings.append({
                "type": "nutrition",
                "condition": "Obesity",
                "ingredient": "High Calories",
                "message": f"Warning: High calorie density ({calories} kcal) - Not ideal for weight management."
            })

    # Check caffeine for pregnancy mode
    if health_condition == "pregnancy" and "caffeine" in ingredient_lower:
        warnings.append({
            "type": "ingredient",
            "condition": "Pregnancy",
            "ingredient": "Caffeine",
            "message": "Warning: Caffeine detected - Limit caffeine intake during pregnancy."
        })

    # Check trigger ingredients for digestive sensitivity
    if health_condition == "digestive_disorder":
        trigger_terms = ["carrageenan", "sorbitol", "maltitol", "xylitol", "sucralose"]
        found_triggers = [term for term in trigger_terms if term in ingredient_lower]
        if found_triggers:
            warnings.append({
                "type": "ingredient",
                "condition": "Digestive Disorder",
                "ingredient": ", ".join(found_triggers[:3]),
                "message": "Warning: Digestive trigger ingredients detected - May cause bloating or gut discomfort."
            })

    return warnings


def detect_additive_interactions(ingredient_text: str, detected_chemicals: List[Dict]) -> List[Dict]:
    """
    FEATURE 5: Detect dangerous additive combinations.
    """
    warnings = []
    ingredient_lower = ingredient_text.lower()
    chemical_names = [c.get('chemical_name', '').lower() for c in detected_chemicals]
    
    for rule in INTERACTION_RULES:
        combo = rule.get('combo', [])
        found_items = []
        
        for item in combo:
            # Check if item is in ingredients or detected chemicals
            if item.lower() in ingredient_lower or any(item.lower() in name for name in chemical_names):
                found_items.append(item)
        
        # If we found at least 2 items from the combo, add warning
        if len(found_items) >= 2:
            warnings.append({
                "type": "additive_interaction",
                "ingredients": found_items,
                "warning": rule.get('warning', ''),
                "severity": rule.get('severity', 'moderate')
            })
    
    return warnings


def extract_nutrition_values(text: str) -> Dict[str, float]:
    """Extract numeric values from nutrition facts text using regex."""
    values = {}
    
    for nutrient, pattern in NUTRITION_PATTERNS.items():
        match = pattern.search(text)
        if match:
            values[nutrient] = float(match.group(1))
        else:
            values[nutrient] = None
    
    return values


def detect_factors(nutrition_text: str, ingredient_text: str = "") -> List[str]:
    """
    Detect all factors from nutrition text and ingredient list.
    Returns a list of detected factor names.
    """
    detected = []
    combined_text = (nutrition_text + " " + ingredient_text).lower()
    
    # Check for nutrition-based factors
    nutrition_values = extract_nutrition_values(nutrition_text)
    
    if nutrition_values.get('sodium') is not None and nutrition_values['sodium'] > 0:
        detected.append("sodium")
    
    if nutrition_values.get('sugar') is not None and nutrition_values['sugar'] > 0:
        detected.append("sugar")
    
    if nutrition_values.get('fat') is not None and nutrition_values['fat'] > 0:
        detected.append("fat")
    
    # Check for caffeine
    caffeine_pattern = re.compile(r'caffeine', re.IGNORECASE)
    if caffeine_pattern.search(combined_text):
        detected.append("caffeine")
    
    # Check ingredient keywords
    for factor, keywords in INGREDIENT_KEYWORDS.items():
        for keyword in keywords:
            if keyword.lower() in combined_text:
                if factor not in detected:
                    detected.append(factor)
                break
    
    # Check for high-risk patterns
    if "hydrogenated" in combined_text or "partially hydrogenated" in combined_text:
        if "hydrogenated oil" not in detected:
            detected.append("hydrogenated oil")
    
    if "artificial color" in combined_text or "artificial colors" in combined_text:
        if "artificial colors" not in detected:
            detected.append("artificial colors")
    
    if "artificial flavor" in combined_text:
        if "artificial flavor" not in detected:
            detected.append("artificial flavor")
    
    if "natural flavor" in combined_text:
        if "natural flavor" not in detected:
            detected.append("natural flavor")
    
    return detected


def map_factors_to_diseases(factors: List[str]) -> List[str]:
    """
    Map detected factors to their associated health risks.
    Returns a deduplicated list of health effects.
    """
    health_effects = set()
    
    for factor in factors:
        if factor in DISEASE_MAPPING:
            health_effects.update(DISEASE_MAPPING[factor])
    
    return sorted(list(health_effects))


def generate_analysis_summary(detected_factors: List[str], health_effects: List[str]) -> str:
    """
    Generate a human-readable analysis summary.
    """
    if not detected_factors:
        return "No significant nutritional concerns detected. This product appears to be a low-risk choice."
    
    # Categorize factors
    categories = {
        "additives": [],
        "sweeteners": [],
        "preservatives": [],
        "nutrients": []
    }
    
    sweetener_factors = ["aspartame", "sucralose", "saccharin", "acesulfame potassium", 
                        "stevia", "sugar alcohols", "sorbitol", "maltitol", "xylitol", 
                        "high fructose corn syrup"]
    preservative_factors = ["sodium benzoate", "potassium benzoate", "sodium nitrite", 
                           "sodium nitrate", "BHA", "BHT", "TBHQ", "sodium metabisulfite",
                           "sulfur dioxide", "parabens"]
    additive_factors = ["monosodium glutamate", "phosphoric acid", "carrageenan", 
                      "artificial colors", "titanium dioxide", "artificial flavor",
                      "natural flavor", "modified food starch", "hydrogenated oil"]
    nutrient_factors = ["sodium", "sugar", "fat", "caffeine"]
    
    for factor in detected_factors:
        if factor in sweetener_factors:
            categories["sweeteners"].append(factor)
        elif factor in preservative_factors:
            categories["preservatives"].append(factor)
        elif factor in additive_factors:
            categories["additives"].append(factor)
        elif factor in nutrient_factors:
            categories["nutrients"].append(factor)
    
    # Build summary
    summary_parts = []
    
    if categories["sweeteners"]:
        summary_parts.append("This product contains artificial or alternative sweeteners.")
    
    if categories["preservatives"]:
        summary_parts.append("Preservatives detected in this product.")
    
    if categories["additives"]:
        summary_parts.append("Food additives are present.")
    
    if categories["nutrients"]:
        nutrient_names = ", ".join(categories["nutrients"])
        summary_parts.append(f"Nutritional factors of interest: {nutrient_names}.")
    
    # Add health risk context
    if health_effects:
        if len(health_effects) <= 3:
            effects = ", ".join(health_effects)
            summary_parts.append(f"Potential health effects: {effects}.")
        else:
            summary_parts.append(f"This product has {len(health_effects)} different health concerns that may affect long-term health if consumed frequently.")
    else:
        summary_parts.append("No significant long-term health risks identified based on detected factors.")
    
    return " ".join(summary_parts)


def analyze_factors(nutrition_text: str, ingredient_text: str = "") -> Dict[str, Any]:
    """
    Main analysis function that detects factors and maps them to health risks.
    """
    # Detect all factors
    detected_factors = detect_factors(nutrition_text, ingredient_text)
    
    # Map to health effects
    health_effects = map_factors_to_diseases(detected_factors)
    
    # Generate summary
    summary = generate_analysis_summary(detected_factors, health_effects)
    
    return {
        "detected_factors": detected_factors,
        "health_effects": health_effects,
        "analysis_summary": summary
    }


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    print(f"DEBUG: Global exception handler caught: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An unexpected error occurred. Please try again.",
            "detected_factors": [],
            "health_effects": [],
            "analysis_summary": "Unable to process request. Please try again."
        }
    )

# API Routes
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "BioGuard AI API",
        "version": "3.0.0",
        "description": "Smart Food Safety & Nutrition Risk Analysis Platform",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy"
    }

@app.get("/chemicals")
async def get_chemicals(
    search: str = Query("", description="Search term for chemical name, E-number, or aliases"),
    risk_level: str = Query("", description="Filter by risk level (High, Moderate, Low, Minimal)"),
    category: str = Query("", description="Filter by category"),
    limit: int = Query(100, description="Maximum number of results to return")
):
    """
    Get chemicals with optional filtering.
    
    - search: Case-insensitive partial search on chemical_name, e_number, e_number_ins, and aliases
    - risk_level: Filter by risk level (exact match, case-insensitive)
    - category: Filter by category (exact match)
    - limit: Maximum results to return (default 100)
    
    Returns:
    {
        "total": 320,
        "chemicals": [...]
    }
    """
    print(f"\nDEBUG: /chemicals endpoint called")
    print(f"  search: '{search}', risk_level: '{risk_level}', category: '{category}', limit: {limit}")
    
    # Start with all chemicals
    results = CHEMICALS_DATA.copy()
    
    # Apply search filter (case-insensitive partial match)
    if search:
        search_lower = search.lower().strip()
        # Also create a normalized version without spaces for INS XXX format
        search_normalized = search_lower.replace(' ', '')
        results = [
            c for c in results
            if (
                search_lower in c.get('chemical_name', '').lower() or
                search_lower in c.get('e_number', '').lower() or
                search_lower in c.get('e_number_ins', '').lower() or
                search_lower in c.get('aliases', '').lower() or
                # Also check normalized versions
                search_normalized in c.get('e_number', '').lower().replace(' ', '') or
                search_normalized in c.get('e_number_ins', '').lower().replace(' ', '') or
                search_normalized in c.get('aliases', '').lower().replace(' ', '')
            )
        ]
        print(f"  After search filter: {len(results)} results")
    
    # Apply risk_level filter (optional - only if provided)
    if risk_level:
        risk_level_lower = risk_level.lower().strip()
        results = [
            c for c in results
            if c.get('risk_level', '').lower() == risk_level_lower
        ]
        print(f"  After risk_level filter: {len(results)} results")
    
    # Apply category filter (optional - only if provided)
    if category:
        category_stripped = category.strip()
        results = [
            c for c in results
            if c.get('category', '').strip() == category_stripped
        ]
        print(f"  After category filter: {len(results)} results")
    
    # Apply limit
    total = len(results)
    results = results[:limit]
    
    # Remove internal fields before returning
    results = [
        {
            'chemical_name': c['chemical_name'],
            'e_number': c['e_number'],
            'category': c['category'],
            'purpose': c['purpose'],
            'risk_level': c['risk_level'],
            'health_concerns': c['health_concerns'],
            'safe_limit': c['safe_limit'],
            'aliases': c['aliases']
        }
        for c in results
    ]
    
    print(f"  Returning {len(results)} chemicals (total: {total})\n")
    
    return {
        "total": total,
        "chemicals": results
    }

@app.post("/analyze-nutrition")
async def analyze_nutrition(request: NutritionAnalysisRequest):
    """
    Analyze nutrition facts text and detect factors associated with long-term health risks.
    
    Accepts JSON:
    {
      "nutrition_text": "Amount Per Serving Calories 0 Sodium 40mg ..."
    }
    
    Returns:
    {
      "detected_factors": ["sodium", "sugar", "aspartame"],
      "health_effects": ["hypertension", "type 2 diabetes", "headaches"],
      "analysis_summary": "This product contains artificial sweeteners..."
    }
    """
    print("Received nutrition text:", request.nutrition_text)
    
    try:
        # Run factor analysis
        analysis_result = analyze_factors(request.nutrition_text)
        
        print("DEBUG: Analysis complete:")
        print(f"  - Detected Factors: {analysis_result['detected_factors']}")
        print(f"  - Health Effects: {analysis_result['health_effects']}")
        print("="*50 + "\n")
        
        return analysis_result
    
    except Exception as e:
        print(f"DEBUG: Error in analyze_nutrition: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/daily-goals")
async def daily_goals(request: DailyGoalsRequest):
    """
    Personalized daily nutrition goals.

    Accepts JSON:
    {
      "age": 28,
      "weight": 72,
      "goal": "weight loss" | "weight gain" | "maintain"
    }
    """
    try:
        goals = calculate_daily_nutrition_goals(
            age=request.age,
            weight=request.weight,
            goal=request.goal,
        )

        calories_goal = int(goals.get("calories_goal", 2100) or 2100)
        protein_goal = int(goals.get("protein_goal", 98) or 98)
        limits = goals.get("limits", {})
        sugar_limit = int((limits.get("sugar", 30) if isinstance(limits, dict) else 30) or 30)
        sodium_limit = int((limits.get("sodium", 2000) if isinstance(limits, dict) else 2000) or 2000)

        return {
            "calories_goal": max(1200, min(4000, calories_goal)),
            "protein_goal": max(40, min(260, protein_goal)),
            "limits": {
                "sugar": max(10, min(80, sugar_limit)),
                "sodium": max(1200, min(3500, sodium_limit)),
            },
        }
    except Exception:
        return {
            "calories_goal": 2100,
            "protein_goal": 98,
            "limits": {
                "sugar": 30,
                "sodium": 2000,
            },
        }


@app.post("/weekly-meal-plan")
async def weekly_meal_plan(request: WeeklyMealPlanRequest):
    """
    Generate weekly meal plan based on user goal, diet type, and budget.

    Input:
    {
      "goal": "weight loss" | "weight gain" | "maintain",
      "diet_type": "veg" | "non-veg" | "eggetarian",
      "budget": "low" | "medium" | "high"
    }
    """
    try:
        # Get parameters with defaults
        goal = request.goal or "maintain"
        diet_type = request.diet_type or "veg"
        budget = request.budget or "medium"
        
        plan = generate_weekly_meal_plan(goal, diet_type, budget)
        if not isinstance(plan, dict) or not plan:
            plan = generate_weekly_meal_plan("maintain", "veg", "medium")

        # Guarantee stable day keys and 3 meals per day.
        stable_plan: Dict[str, List[str]] = {}
        for idx in range(1, 8):
            key = f"day{idx}"
            meals = plan.get(key, [])
            if not isinstance(meals, list):
                meals = []
            safe_meals = [str(item).strip() for item in meals if str(item).strip()]
            while len(safe_meals) < 3:
                safe_meals.append("Balanced meal")
            stable_plan[key] = safe_meals[:3]

        return {
            "weekly_plan": stable_plan,
            "metadata": {
                "goal": goal,
                "diet_type": diet_type,
                "budget": budget
            }
        }
    except Exception:
        fallback = generate_weekly_meal_plan("maintain", "veg", "medium")
        return {
            "weekly_plan": fallback,
            "metadata": {
                "goal": "maintain",
                "diet_type": "veg",
                "budget": "medium"
            }
        }

# ============================================
# AI CHATBOT ENDPOINT
# ============================================

class ChatRequest(BaseModel):
    question: str

@app.post("/chat")
async def chat_query(request: ChatRequest):
    """
    AI Chatbot endpoint for querying food additives and chemicals.
    
    Accepts JSON:
    {
      "question": "What is E621?"
    }
    
    Returns structured JSON with chemical information or fallback response.
    """
    question = request.question.strip()
    question_lower = question.lower()
    
    print(f"\nDEBUG: /chat endpoint called with question: '{question}'")
    
    # STEP 1: Extract E-numbers from question
    e_numbers = re.findall(r'E(\d+)', question.upper())
    
    # Also check for INS numbers
    ins_numbers = re.findall(r'INS\s*(\d+)', question, re.IGNORECASE)
    
    print(f"  Detected E-numbers: {e_numbers}")
    print(f"  Detected INS numbers: {ins_numbers}")
    
    # STEP 2: Search for chemical by E-number
    found_chemical = None
    
    # Check E-numbers in question
    for e_num in e_numbers:
        key = f'e{e_num}'
        if key in CHEMICAL_INDEX:
            found_chemical = CHEMICAL_INDEX[key]
            print(f"  Found chemical by E-number: {key}")
            break
        # Also try without E prefix
        key_no_e = e_num
        if key_no_e in CHEMICAL_INDEX:
            found_chemical = CHEMICAL_INDEX[key_no_e]
            print(f"  Found chemical by number: {key_no_e}")
            break
    
    # Check INS numbers in question
    if not found_chemical:
        for ins_num in ins_numbers:
            key = f'e{ins_num}'
            if key in CHEMICAL_INDEX:
                found_chemical = CHEMICAL_INDEX[key]
                print(f"  Found chemical by INS: {key}")
                break
    
    # STEP 3: Search by chemical name or alias
    if not found_chemical:
        # Search in chemical names and aliases
        for key, chem in CHEMICAL_INDEX.items():
            if key in question_lower:
                found_chemical = chem
                print(f"  Found chemical by name/alias: {key}")
                break
    
    # STEP 4: Handle category/risk queries
    if not found_chemical:
        # Check for category queries like "preservatives", "flavor enhancers"
        category_keywords = {
            'preservative': 'Preservative',
            'preservatives': 'Preservative',
            'flavor enhancer': 'Flavour Enhancer',
            'flavor enhancers': 'Flavour Enhancer',
            'flavour enhancer': 'Flavour Enhancer',
            'flavour enhancers': 'Flavour Enhancer',
            'color': 'Colour',
            'colors': 'Colour',
            'colour': 'Colour',
            'colours': 'Colour',
            'sweetener': 'Sweetener',
            'sweeteners': 'Sweetener',
            'emulsifier': 'Emulsifier',
            'emulsifiers': 'Emulsifier',
            'stabilizer': 'Stabiliser',
            'stabilizers': 'Stabiliser',
            'stabiliser': 'Stabiliser',
            'stabilisers': 'Stabiliser',
            'acid': 'Acid',
            'acids': 'Acid',
            'antioxidant': 'Antioxidant',
            'antioxidants': 'Antioxidant',
        }
        
        # Check for risk level queries
        risk_keywords = {
            'high risk': 'High',
            'high-risk': 'High',
            'moderate risk': 'Moderate',
            'moderate-risk': 'Moderate',
            'low risk': 'Low',
            'low-risk': 'Low',
        }
        
        # Check for specific queries
        query_category = None
        query_risk = None
        
        for kw, cat in category_keywords.items():
            if kw in question_lower:
                query_category = cat
                break
        
        for kw, risk in risk_keywords.items():
            if kw in question_lower:
                query_risk = risk
                break
        
        # If we have category and/or risk filters
        if query_category or query_risk:
            filtered_chemicals = CHEMICALS_DATA.copy()
            
            if query_category:
                filtered_chemicals = [
                    c for c in filtered_chemicals 
                    if c.get('category', '').lower() == query_category.lower()
                ]
            
            if query_risk:
                filtered_chemicals = [
                    c for c in filtered_chemicals 
                    if c.get('risk_level', '').lower() == query_risk.lower()
                ]
            
            if filtered_chemicals:
                # Return a list response
                result_list = []
                for c in filtered_chemicals[:10]:  # Limit to 10 results
                    result_list.append({
                        "chemical_name": c.get('chemical_name', ''),
                        "e_number": c.get('e_number', ''),
                        "category": c.get('category', ''),
                        "risk_level": c.get('risk_level', ''),
                        "health_concerns": c.get('health_concerns', '')
                    })
                
                category_text = query_category if query_category else "chemicals"
                risk_text = f" {query_risk} risk" if query_risk else ""
                
                return {
                    "answer": f"Found {len(filtered_chemicals)} {category_text}{risk_text} in the database. Here are some examples:",
                    "type": "list",
                    "chemicals": result_list,
                    "total_found": len(filtered_chemicals)
                }
    
    # STEP 5: Return chemical info if found
    if found_chemical:
        return {
            "answer": f"{found_chemical.get('e_number', '')} is {found_chemical.get('chemical_name', '')}",
            "chemical_name": found_chemical.get('chemical_name', ''),
            "e_number": found_chemical.get('e_number', ''),
            "category": found_chemical.get('category', ''),
            "risk_level": found_chemical.get('risk_level', ''),
            "health_concerns": found_chemical.get('health_concerns', ''),
            "purpose": found_chemical.get('purpose', ''),
            "safe_limit": found_chemical.get('safe_limit', ''),
            "type": "single"
        }
    
    # STEP 6: Fallback response
    return {
        "answer": "I could not find that chemical in the BioGuard database. Try searching using an E-number (e.g., E621) or additive name.",
        "type": "not_found"
    }


# ============================================
# OCR ENDPOINT FOR CAMERA SCANNING
# ============================================

def extract_text_from_image(image):
    """
    Extract text from an image using Tesseract OCR.
    
    Args:
        image: PIL Image object
    
    Returns:
        Extracted text string
    """
    def score_text(text: str) -> int:
        # Prioritize ingredient-like OCR output: words + separators.
        cleaned = re.sub(r"\s+", " ", text or "").strip()
        if not cleaned:
            return 0
        alpha_num = sum(ch.isalnum() for ch in cleaned)
        commas = cleaned.count(",")
        return alpha_num + (commas * 8)

    def normalize_ocr_text(text: str) -> str:
        return re.sub(r"\s+", " ", (text or "")).strip()

    try:
        img_array = np.array(image)
        if len(img_array.shape) == 3:
            gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        else:
            gray = img_array

        h, w = gray.shape[:2]
        # Upscale small text regions to help Tesseract.
        scale = max(1.0, min(3.0, 1600.0 / max(1, min(h, w))))
        if scale > 1.15:
            gray = cv2.resize(gray, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)

        # Build several preprocessed variants and pick the best OCR result.
        variants = []
        variants.append(("gray", gray))

        # Otsu threshold.
        _, otsu = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        variants.append(("otsu", otsu))

        # Adaptive threshold for uneven lighting.
        adaptive = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 12
        )
        variants.append(("adaptive", adaptive))

        # CLAHE + threshold can recover faint text.
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(gray)
        _, clahe_otsu = cv2.threshold(clahe, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        variants.append(("clahe_otsu", clahe_otsu))

        best_text = ""
        best_score = 0
        psm_modes = (6, 11)

        for variant_name, variant_img in variants:
            pil_img = Image.fromarray(variant_img)
            for psm in psm_modes:
                config = f"--oem 3 --psm {psm} -c preserve_interword_spaces=1"
                try:
                    text = pytesseract.image_to_string(pil_img, lang="eng", config=config)
                    normalized = normalize_ocr_text(text)
                    score = score_text(normalized)
                    if score > best_score:
                        best_score = score
                        best_text = normalized
                except Exception as inner_e:
                    print(f"OCR variant failed ({variant_name}, psm={psm}): {inner_e}")

        if best_text:
            return best_text

        # Last-resort fallback.
        text = pytesseract.image_to_string(image, lang="eng", config="--oem 3 --psm 6")
        return normalize_ocr_text(text)
    except Exception as e:
        print(f"OCR Error: {str(e)}")
        return ""


def extract_ingredients(text):
    """
    Extract ingredients from OCR text by splitting on commas.
    
    Args:
        text: Full OCR text
    
    Returns:
        List of extracted ingredients
    """
    text = text.replace("\n", " ")

    # Support labels separated by commas, semicolons, or line breaks.
    parts = re.split(r"[,;]", text)
    
    ingredients = []
    
    for part in parts:
        clean = part.strip()
        # Filter: keep parts with reasonable length.
        if len(clean) > 2 and len(clean) < 120:
            ingredients.append(clean)
    
    return ingredients


@app.post("/ocr")
async def perform_ocr(file: UploadFile = File(...)):
    """
    FEATURE: OCR endpoint for ingredient label scanning.
    
    Accepts an image file and returns extracted text/ingredients.
    
    Returns JSON:
    {
      "ocr_text": "Full extracted text from image",
      "extracted_ingredients": ["list", "of", "ingredients"]
    }
    """
    print("=" * 60)
    print("/ocr ENDPOINT CALLED")
    print(f"  File: {file.filename}")
    
    try:
        # Validate OCR engine availability for clearer error reporting.
        try:
            _ = pytesseract.get_tesseract_version()
        except Exception:
            raise HTTPException(
                status_code=500,
                detail=(
                    "Tesseract OCR engine is not available on the backend server. "
                    "Install Tesseract and set TESSERACT_CMD if needed."
                )
            )

        # Read the uploaded file
        contents = await file.read()
        
        # Open image with PIL
        image = Image.open(io.BytesIO(contents))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        print(f"  Image size: {image.size}")
        
        # Extract text using Tesseract
        ocr_text = extract_text_from_image(image)
        
        print(f"  OCR text length: {len(ocr_text)}")
        print(f"  OCR text preview: {ocr_text[:100] if ocr_text else 'None'}...")
        
        # Only reject if text is extremely short
        if len(ocr_text.strip()) < 5:
            raise HTTPException(
                status_code=400,
                detail="OCR could not detect readable text"
            )
        
        # Extract ingredients from the OCR text
        ingredients = extract_ingredients(ocr_text)
        
        print(f"  Extracted ingredients: {ingredients[:5] if ingredients else 'None'}...")
        
        return {
            "ocr_text": ocr_text,
            "extracted_ingredients": ingredients
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"OCR Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")


# =============================================================================
# PERSONAL CARE CHEMICALS - Data Loading
# =============================================================================
PERSONAL_CARE_DATA = []
PERSONAL_CARE_CSV_PATH = Path(__file__).parent / "data" / "personal_care_chemicals.csv"

def load_personal_care_csv():
    """Load personal care chemicals from CSV file."""
    global PERSONAL_CARE_DATA
    chemicals = []
    
    try:
        with open(PERSONAL_CARE_CSV_PATH, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                chemical = {
                    'name': row.get('name', '').strip(),
                    'risk': row.get('risk', '').strip(),
                    'effects': row.get('effects', '').strip(),
                    'avoid_for': row.get('avoid_for', '').strip(),
                    'description': row.get('description', '').strip()
                }
                chemicals.append(chemical)
        
        PERSONAL_CARE_DATA = chemicals
        print(f"DEBUG: Loaded personal care chemicals: {len(chemicals)}")
    except Exception as e:
        print(f"ERROR: Failed to load personal care chemicals CSV: {e}")
        PERSONAL_CARE_DATA = []

# Load personal care chemicals on module import
load_personal_care_csv()


# =============================================================================
# PERSONAL CARE MODELS
# =============================================================================

class PersonalCareAnalysisRequest(BaseModel):
    """Request model for personal care product analysis."""
    ingredients: str
    product_type: Optional[str] = ""
    skin_type: Optional[str] = ""
    hair_type: Optional[str] = ""


class PersonalCareChatRequest(BaseModel):
    """Request model for personal care chatbot."""
    question: str


# =============================================================================
# PERSONAL CARE ENDPOINTS
# =============================================================================

@app.get("/personal-care-chemicals")
async def get_personal_care_chemicals(
    search: Optional[str] = Query(None, description="Search term"),
    risk_level: Optional[str] = Query(None, description="Filter by risk level"),
    limit: int = Query(100, description="Maximum results")
):
    """Get personal care chemicals database with optional filtering."""
    results = PERSONAL_CARE_DATA
    
    # Filter by search term
    if search:
        search_lower = search.lower()
        results = [c for c in results if search_lower in c['name'].lower()]
    
    # Filter by risk level
    if risk_level:
        results = [c for c in results if c['risk'].lower() == risk_level.lower()]
    
    # Limit results
    results = results[:limit]
    
    return {
        "chemicals": results,
        "total": len(results)
    }


def analyze_personal_care_chemicals(ingredients: str, skin_type: str = "", hair_type: str = ""):
    """
    Analyze personal care product ingredients.
    
    Returns detected chemicals with risk assessment and recommendations.
    """
    detected_chemicals = []
    all_effects = set()
    recommendations = []
    
    # Normalize ingredients for searching
    ingredients_lower = ingredients.lower()
    
    # Search each chemical in the ingredients
    for chemical in PERSONAL_CARE_DATA:
        chemical_name = chemical['name'].lower()
        # Check if chemical name or alias is in ingredients
        if chemical_name in ingredients_lower:
            detected_chemicals.append({
                'name': chemical['name'],
                'risk': chemical['risk'],
                'effects': chemical['effects'],
                'avoid_for': chemical['avoid_for'],
                'description': chemical['description']
            })
            
            # Collect effects
            if chemical['effects']:
                for effect in chemical['effects'].split(','):
                    all_effects.add(effect.strip())
    
    # Determine overall risk level
    risk_level = "Low"
    if any(c['risk'] == 'High' for c in detected_chemicals):
        risk_level = "High"
    elif any(c['risk'] == 'Moderate' for c in detected_chemicals):
        risk_level = "Moderate"
    
    # Determine suitability based on skin/hair type
    suitability = "Suitable for your profile"
    user_profile_items = []
    if skin_type:
        user_profile_items.append(skin_type.lower())
    if hair_type:
        user_profile_items.append(hair_type.lower())
    
    for chemical in detected_chemicals:
        avoid_for = chemical.get('avoid_for', '').lower()
        if avoid_for and avoid_for != 'all':
            for profile_item in user_profile_items:
                if profile_item in avoid_for or profile_item.replace(' ', '') in avoid_for.replace(' ', ''):
                    suitability = f"Not suitable for {skin_type or hair_type} (contains {chemical['name']})"
                    break
    
    # Generate recommendations based on detected chemicals
    for chemical in detected_chemicals:
        name = chemical['name']
        if name.upper() in ['SLS', 'SODIUM LAURYL SULFATE']:
            recommendations.append("Consider using sulfate-free products to reduce skin irritation")
        elif name.upper() in ['SLES', 'SODIUM LAURETH SULFATE']:
            recommendations.append("Look for products without SLES for gentler cleansing")
        elif name.upper() in ['PARABENS']:
            recommendations.append("Choose paraben-free products to avoid potential hormone disruption")
        elif name.upper() in ['PHTHALATES']:
            recommendations.append("Avoid products with phthalates - look for 'phthalate-free' labels")
        elif name.upper() in ['FORMALDEHYDE']:
            recommendations.append("Avoid formaldehyde-releasing preservatives")
        elif name.upper() in ['TRICLOSAN']:
            recommendations.append("Triclosan is linked to antibiotic resistance - consider alternatives")
        elif name.upper() in ['SYNTHETIC FRAGRANCES']:
            recommendations.append("Look for fragrance-free or naturally scented products")
        elif name.upper() in ['OXYBENZONE', 'OCTINOXATE']:
            recommendations.append("Consider mineral-based sunscreens for reef-safe protection")
        elif name.upper() in ['HYDROQUINONE']:
            recommendations.append("Avoid hydroquinone - consider vitamin C or niacinamide for brightening")
        elif name.upper() in ['MERCURY', 'ARSENIC', 'LEAD']:
            recommendations.append("Avoid products with toxic heavy metals - these are dangerous")
    
    # If no chemicals found, add positive message
    if not detected_chemicals:
        recommendations.append("No harmful chemicals detected - product appears safe!")
    
    return {
        'detected_chemicals': detected_chemicals,
        'risk_level': risk_level,
        'effects': list(all_effects),
        'suitability': suitability,
        'recommendations': recommendations
    }


@app.post("/analyze-personal-care")
async def analyze_personal_care(request: PersonalCareAnalysisRequest):
    """
    Analyze personal care product ingredients.
    
    Accepts JSON:
    {
      "ingredients": "water, glycerin, SLS, paraben...",
      "product_type": "skincare",
      "skin_type": "sensitive",
      "hair_type": ""
    }
    
    Returns:
    {
      "detected_chemicals": [...],
      "risk_level": "High/Moderate/Low",
      "effects": [...],
      "suitability": "...",
      "recommendations": [...]
    }
    """
    print("="*60)
    print("ANALYZE PERSONAL CARE ENDPOINT CALLED")
    print(f"  Ingredients: {request.ingredients[:100] if request.ingredients else 'None'}...")
    print(f"  Product Type: {request.product_type}")
    print(f"  Skin Type: {request.skin_type}")
    print(f"  Hair Type: {request.hair_type}")
    
    # Validate input
    if not request.ingredients or not request.ingredients.strip():
        return {
            "detected_chemicals": [],
            "risk_level": "Low",
            "effects": [],
            "suitability": "No ingredients provided for analysis",
            "recommendations": ["Please provide ingredients to analyze"]
        }
    
    try:
        result = analyze_personal_care_chemicals(
            request.ingredients,
            skin_type=request.skin_type,
            hair_type=request.hair_type
        )
        
        print(f"  Risk Level: {result['risk_level']}")
        print(f"  Detected Chemicals: {len(result['detected_chemicals'])}")
        print("="*60)
        
        return result
    
    except Exception as e:
        print(f"ERROR in analyze_personal_care: {e}")
        return {
            "detected_chemicals": [],
            "risk_level": "Unknown",
            "effects": [],
            "suitability": "Analysis failed",
            "recommendations": ["No data available"]
        }


def generate_personal_care_chat_response(question: str) -> dict:
    """Generate response for personal care chatbot queries."""
    question_lower = question.lower()
    
    # Search for chemicals in the question
    found_chemicals = []
    for chemical in PERSONAL_CARE_DATA:
        if chemical['name'].lower() in question_lower:
            found_chemicals.append({
                'name': chemical['name'],
                'risk_level': chemical['risk'],
                'effects': chemical['effects'],
                'avoid_for': chemical['avoid_for']
            })
    
    # If we found chemicals, provide detailed response
    if found_chemicals:
        if len(found_chemicals) == 1:
            chem = found_chemicals[0]
            answer = f"**{chem['name']}** is classified as **{chem['risk_level']} risk**. "
            if chem['effects']:
                answer += f"Potential effects: {chem['effects']}. "
            if chem['avoid_for'] and chem['avoid_for'] != 'All':
                answer += f"People with {chem['avoid_for']} should avoid this ingredient."
            return {
                'answer': answer,
                'type': 'single',
                'name': chem['name'],
                'risk_level': chem['risk_level'],
                'effects': chem['effects'],
                'avoid_for': chem['avoid_for']
            }
        else:
            answer = f"I found {len(found_chemicals)} chemicals in your question:\n\n"
            for chem in found_chemicals:
                answer += f"• **{chem['name']}** ({chem['risk_level']} risk)\n"
            return {
                'answer': answer,
                'type': 'list',
                'chemicals': found_chemicals
            }
    
    # General questions about personal care
    if any(word in question_lower for word in ['safe', 'harmful', 'dangerous', 'toxic']):
        answer = "For personal care products, here are some ingredients to be aware of:\n\n"
        """High Risk: SLS, Formaldehyde, Phthalates, Hydroquinone, Mercury, Lead\n"""
        """Moderate Risk: Parabens, Triclosan, Synthetic Fragrances, BHT\n\n"""
        """For sensitive skin, avoid: SLS, Synthetic Fragrances, Parabens\n"""
        """For hair care, be cautious with: SLS, SLES, Silicones (if avoiding buildup)"""
        return {'answer': answer, 'type': 'general'}
    
    if any(word in question_lower for word in ['paraben', 'sulfonate', 'fragrance']):
        # Provide general info about these common ingredients
        answers = {
            'paraben': "Parabens are preservatives that can disrupt hormones. They absorb through skin and have been found in breast tissue. Many people prefer paraben-free products.",
            'sulfonate': "Sulfates (like SLS) are cleansing agents that create foam but can irritate sensitive skin. They strip natural oils from skin and hair.",
            'fragrance': "Synthetic fragrances are a leading cause of skin allergies. They can cause dermatitis, headaches, and respiratory issues. Fragrance-free is often safer."
        }
        for key, ans in answers.items():
            if key in question_lower:
                return {'answer': ans, 'type': 'general'}
    
    # Default response
    return {
        'answer': "I can help you understand personal care product ingredients. Ask me about specific chemicals like SLS, parabens, or fragrance, or ask if certain ingredients are safe.",
        'type': 'general'
    }


@app.post("/chat-personal-care")
async def chat_personal_care(request: PersonalCareChatRequest):
    """Personal care chatbot endpoint."""
    print("="*60)
    print("CHAT PERSONAL CARE ENDPOINT CALLED")
    print(f"  Question: {request.question}")
    
    try:
        result = generate_personal_care_chat_response(request.question)
        print(f"  Response Type: {result.get('type')}")
        print("="*60)
        return result
    except Exception as e:
        print(f"ERROR in chat_personal_care: {e}")
        return {
            'answer': "Sorry, I encountered an error. Please try again.",
            'type': 'error'
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


# ============================================
# NEW COMPREHENSIVE ANALYSIS ENDPOINT
# ============================================

@app.post("/analyze")
async def analyze_food_simple(
    ingredients: str = Form(None),
    nutrition: str = Form(None),
    language: str = Form("auto")
):
    """
    Simple food analysis endpoint using Form data.
    
    Accepts Form data:
    - ingredients: comma-separated ingredient list
    - nutrition: nutrition facts text
    - language: source language for translation (auto, en, es, hi, kn, etc.)
    
    Returns JSON with risk_level and detected_chemicals.
    """
    print("="*60)
    print("/analyze ENDPOINT CALLED")
    print(f"  Ingredients: {ingredients[:100] if ingredients else 'None'}...")
    print(f"  Language: {language}")
    print(f"  Nutrition: {nutrition[:100] if nutrition else 'None'}...")
    
    # Validate input - return safe fallback for empty or invalid input
    if not ingredients or not ingredients.strip():
        return {
            "risk_level": "Low",
            "detected_chemicals": [],
            "hidden_ingredients": [],
            "explanation": "No ingredients provided for analysis.",
            "risk_score": 0,
            "food_score": 100,
            "confidence": 0,
            "summary": generate_risk_summary(0),
            "decision": "Safe to eat",
            "complexity_score": 0,
            "suggestions": [],
            "timeline": [],
            "impact": "Minimal long-term impact",
            "recommendations": [],
            "pairing_suggestions": [],
            "recommended_meals": DEFAULT_RECOMMENDED_MEALS.copy(),
            "deficiencies": [],
            "category": "Healthy",
            "simplified": "No data available",
            "simplified_summary": "No data available",
            "parsed_ingredients": [],
            "food_safety_score": 100,
            "diseases": [],
            "nutrition_issues": [],
            "original_ingredients": "",
            "translated_ingredients": "",
            "was_translated": False
        }
    
    try:
        # Translate ingredients to English if needed
        ingredients_to_analyze = ingredients
        
        should_translate = False
        if ingredients and language:
            if language not in ("en", "auto"):
                should_translate = True
            elif language == "auto":
                should_translate = should_auto_translate(ingredients)

        if should_translate:
            print(f"DEBUG: Translating ingredients from '{language}' to English...")
            ingredients_to_analyze = translate_to_english(
                ingredients,
                source_language=language
            )
            print(f"DEBUG: Translated: '{ingredients_to_analyze[:100]}...'")
        
        # Run comprehensive analysis
        result = analyze_food_comprehensive(
            ingredient_text=ingredients_to_analyze or "",
            nutrition_text=nutrition or ""
        )
        
        # Normalize key fields so /analyze never returns null values.
        risk_score = max(0, min(100, int(float(result.get("risk_score", 0) or 0))))
        food_safety_score = max(
            0,
            min(100, int(float(result.get("food_safety_score", max(0, 100 - risk_score)) or max(0, 100 - risk_score))))
        )
        food_score = max(
            0,
            min(100, int(float(result.get("food_score", food_safety_score) or food_safety_score)))
        )
        confidence = max(0, min(100, int(float(result.get("confidence", 0) or 0))))
        complexity_score = max(0, min(100, int(float(result.get("complexity_score", 0) or 0))))

        risk_level = result.get("risk_level")
        if not isinstance(risk_level, str) or not risk_level.strip():
            risk_level = "Low" if risk_score < 40 else ("Moderate" if risk_score < 70 else "High")

        summary = result.get("summary")
        if not isinstance(summary, str) or not summary.strip():
            summary = generate_risk_summary(risk_score)

        decision = result.get("decision")
        if not isinstance(decision, str) or not decision.strip():
            decision = "Safe to eat"

        impact = result.get("impact")
        if not isinstance(impact, str) or not impact.strip():
            impact = "Minimal long-term impact"

        category = result.get("category")
        if not isinstance(category, str) or not category.strip():
            category = "Healthy"

        simplified = result.get("simplified")
        if not isinstance(simplified, str) or not simplified.strip():
            simplified = "No data available"
        simplified_summary = result.get("simplified_summary")
        if not isinstance(simplified_summary, str) or not simplified_summary.strip():
            simplified_summary = simplified

        explanation = result.get("recommendation")
        if not isinstance(explanation, str):
            explanation = ""

        suggestions = result.get("suggestions")
        if not isinstance(suggestions, list):
            suggestions = []

        timeline = result.get("timeline")
        if not isinstance(timeline, list):
            timeline = []

        recommendations = result.get("recommendations")
        if not isinstance(recommendations, list):
            recommendations = []

        pairing_suggestions = result.get("pairing_suggestions")
        if not isinstance(pairing_suggestions, list):
            pairing_suggestions = []

        recommended_meals = result.get("recommended_meals")
        if not isinstance(recommended_meals, list) or not recommended_meals:
            recommended_meals = DEFAULT_RECOMMENDED_MEALS.copy()

        deficiencies = result.get("deficiencies")
        if not isinstance(deficiencies, list):
            deficiencies = []

        parsed_ingredients = result.get("parsed_ingredients")
        if not isinstance(parsed_ingredients, list):
            parsed_ingredients = []

        detected_chemicals = result.get("detected_chemicals")
        if not isinstance(detected_chemicals, list):
            detected_chemicals = []

        hidden_ingredients = result.get("hidden_ingredients")
        if not isinstance(hidden_ingredients, list):
            hidden_ingredients = []

        diseases = result.get("diseases")
        if not isinstance(diseases, list):
            diseases = []

        nutrition_issues = result.get("nutrition_issues")
        if not isinstance(nutrition_issues, list):
            nutrition_issues = []

        # Return the required format
        return {
            "risk_level": risk_level,
            "detected_chemicals": detected_chemicals,
            "hidden_ingredients": hidden_ingredients,
            "explanation": explanation,
            "risk_score": risk_score,
            "food_score": food_score,
            "confidence": confidence,
            "summary": summary,
            "decision": decision,
            "complexity_score": complexity_score,
            "suggestions": suggestions,
            "timeline": timeline,
            "impact": impact,
            "recommendations": recommendations,
            "pairing_suggestions": pairing_suggestions,
            "recommended_meals": recommended_meals,
            "deficiencies": deficiencies,
            "category": category,
            "simplified": simplified,
            "simplified_summary": simplified_summary,
            "parsed_ingredients": parsed_ingredients,
            "food_safety_score": food_safety_score,
            "diseases": diseases,
            "nutrition_issues": nutrition_issues,
            "original_ingredients": ingredients or "",
            "translated_ingredients": ingredients_to_analyze or "",
            "was_translated": bool(ingredients and ingredients_to_analyze != ingredients)
        }
    
    except Exception as e:
        print(f"DEBUG: Error in /analyze: {str(e)}")
        import traceback
        traceback.print_exc()
        # Return safe fallback instead of raising exception
        return {
            "risk_level": "Low",
            "detected_chemicals": [],
            "hidden_ingredients": [],
            "explanation": "Analysis could not be completed. Please try again.",
            "risk_score": 0,
            "food_score": 100,
            "confidence": 0,
            "summary": generate_risk_summary(0),
            "decision": "Safe to eat",
            "complexity_score": 0,
            "suggestions": [],
            "timeline": [],
            "impact": "Minimal long-term impact",
            "recommendations": [],
            "pairing_suggestions": [],
            "recommended_meals": DEFAULT_RECOMMENDED_MEALS.copy(),
            "deficiencies": [],
            "category": "Healthy",
            "simplified": "No data available",
            "simplified_summary": "No data available",
            "parsed_ingredients": [],
            "food_safety_score": 100,
            "diseases": [],
            "nutrition_issues": [],
            "original_ingredients": ingredients or "",
            "translated_ingredients": ingredients or "",
            "was_translated": False,
            "error": str(e)
        }

@app.post("/analyze-food")
async def analyze_food(request: FoodAnalysisRequest):
    """
    Comprehensive food analysis using database-driven chemical detection.
    
    This endpoint uses the priority-based risk scoring system:
    - If ANY high-risk chemical exists → HIGH
    - Else if 2+ moderate chemicals → MODERATE  
    - Else if only low/minimal chemicals → LOW
    
    Accepts JSON:
    {
      "ingredients": "water, sugar, aspartame, citric acid...",
      "nutrition_text": "Calories 0 Sodium 40mg...",
      "health_condition": "diabetes" (optional)
    }
    
    Returns:
    {
      "risk_level": "High",
      "risk_score": 85,
      "detected_chemicals": [...],
      "diseases": [...],
      "nutrition_issues": [...],
      "recommendation": "...",
      "processing_level": "Ultra Processed",
      "health_warnings": [...],
      "additive_interactions": [...]
    }
    """
    print("="*60)
    print("ANALYZE FOOD ENDPOINT CALLED")
    print(f"  Ingredients: {request.ingredients[:100]}...")
    print(f"  Language: {request.language}")
    print(f"  Health Condition: {request.health_condition}")
    print(f"  Nutrition text: {request.nutrition_text[:100] if request.nutrition_text else 'None'}...")
    
    # Validate input - return safe fallback for empty or invalid input
    if not request.ingredients or not request.ingredients.strip():
        return {
            "risk_score": 0,
            "risk_level": "Low",
            "food_score": 100,
            "confidence": 0,
            "summary": generate_risk_summary(0),
            "decision": "Safe to eat",
            "complexity_score": 0,
            "suggestions": [],
            "timeline": [],
            "impact": "Minimal long-term impact",
            "recommendations": [],
            "recommended_meals": generate_recommended_meals(request.health_condition),
            "deficiencies": [],
            "category": "Healthy",
            "simplified": "No data available",
            "simplified_summary": "No data available",
            "parsed_ingredients": [],
            "food_safety_score": 100,
            "detected_chemicals": [],
            "hidden_ingredients": [],
            "total_additives": 0,
            "diseases": [],
            "nutrition_issues": [],
            "recommendation": "No ingredients provided for analysis.",
            "original_ingredients": "",
            "translated_ingredients": "",
            "was_translated": False,
            "chemical_summary": {"chemical_score": 0, "density_bonus": 0, "nutrition_bonus": 0, "total_count": 0},
            "nutrition_summary": {"values": {}, "issues_count": 0},
            "ingredient_explanations": [],
            "processing_level": "Unknown",
            "health_warnings": [],
            "health_condition": request.health_condition,
            "additive_interactions": []
        }
    
    try:
        # Translate ingredients to English if needed
        original_ingredients = request.ingredients
        ingredients_to_analyze = request.ingredients
        
        # If language is not English, translate
        should_translate = False
        if request.language:
            if request.language not in ("en", "auto"):
                should_translate = True
            elif request.language == "auto":
                should_translate = should_auto_translate(request.ingredients)

        if should_translate:
            print(f"DEBUG: Translating ingredients from '{request.language}' to English...")
            ingredients_to_analyze = translate_to_english(
                request.ingredients,
                source_language=request.language
            )
            print(f"DEBUG: Translated: '{ingredients_to_analyze[:100]}...'")
        
        # Run comprehensive analysis with health condition
        result = analyze_food_comprehensive(
            ingredient_text=ingredients_to_analyze,
            nutrition_text=request.nutrition_text or "",
            health_condition=request.health_condition
        )
        
        # Normalize key fields to avoid downstream frontend crashes.
        if not isinstance(result.get('detected_chemicals'), list):
            result['detected_chemicals'] = []
        if not isinstance(result.get('hidden_ingredients'), list):
            result['hidden_ingredients'] = []
        if not isinstance(result.get('summary'), str) or not result.get('summary', '').strip():
            result['summary'] = generate_risk_summary(result.get('risk_score', 0))
        if not isinstance(result.get('decision'), str) or not result.get('decision', '').strip():
            result['decision'] = "Safe to eat"
        try:
            result['complexity_score'] = max(0, min(100, int(result.get('complexity_score', 0) or 0)))
        except (TypeError, ValueError):
            result['complexity_score'] = 0
        try:
            result['food_score'] = max(0, min(100, int(result.get('food_score', result.get('food_safety_score', 0)) or 0)))
        except (TypeError, ValueError):
            result['food_score'] = 0
        try:
            result['confidence'] = max(0, min(100, int(result.get('confidence', 0) or 0)))
        except (TypeError, ValueError):
            result['confidence'] = 0
        if not isinstance(result.get('suggestions'), list):
            result['suggestions'] = []
        if not isinstance(result.get('timeline'), list):
            result['timeline'] = []
        if not isinstance(result.get('impact'), str) or not result.get('impact', '').strip():
            result['impact'] = "Minimal long-term impact"
        if not isinstance(result.get('recommendations'), list):
            result['recommendations'] = []
        if not isinstance(result.get('recommended_meals'), list) or not result.get('recommended_meals'):
            result['recommended_meals'] = generate_recommended_meals(request.health_condition)
        if not isinstance(result.get('deficiencies'), list):
            result['deficiencies'] = []
        if not isinstance(result.get('category'), str) or not result.get('category', '').strip():
            result['category'] = "Healthy"
        if not isinstance(result.get('simplified'), str) or not result.get('simplified', '').strip():
            result['simplified'] = "No data available"
        if not isinstance(result.get('simplified_summary'), str) or not result.get('simplified_summary', '').strip():
            result['simplified_summary'] = result.get('simplified', 'No data available')
        if not isinstance(result.get('parsed_ingredients'), list):
            result['parsed_ingredients'] = []
        if not isinstance(result.get('diseases'), list):
            result['diseases'] = []
        if not isinstance(result.get('nutrition_issues'), list):
            result['nutrition_issues'] = []
        if not isinstance(result.get('health_warnings'), list):
            result['health_warnings'] = []
        if not isinstance(result.get('additive_interactions'), list):
            result['additive_interactions'] = []

        # Add original and translated ingredients to result for display
        result['original_ingredients'] = original_ingredients
        result['translated_ingredients'] = ingredients_to_analyze
        result['was_translated'] = ingredients_to_analyze != original_ingredients
        
        print(f"\n  Results:")
        print(f"    Risk Level: {result['risk_level']}")
        print(f"    Risk Score: {result['risk_score']}")
        print(f"    Detected Chemicals: {len(result.get('detected_chemicals', []))}")
        print(f"    Processing Level: {result.get('processing_level', 'Unknown')}")
        print(f"    Health Warnings: {len(result.get('health_warnings', []))}")
        print(f"    Additive Interactions: {len(result.get('additive_interactions', []))}")
        print(f"    Diseases: {len(result.get('diseases', []))}")
        print(f"    Nutrition Issues: {len(result.get('nutrition_issues', []))}")
        print("="*60 + "\n")
        
        return result
    
    except Exception as e:
        print(f"DEBUG: Error in analyze_food: {str(e)}")
        import traceback
        traceback.print_exc()
        # Return safe fallback instead of raising exception to prevent frontend crash
        return {
            "risk_score": 0,
            "risk_level": "Low",
            "food_score": 100,
            "confidence": 0,
            "summary": generate_risk_summary(0),
            "decision": "Safe to eat",
            "complexity_score": 0,
            "suggestions": [],
            "timeline": [],
            "impact": "Minimal long-term impact",
            "recommendations": [],
            "recommended_meals": generate_recommended_meals(request.health_condition),
            "deficiencies": [],
            "category": "Healthy",
            "simplified": "No data available",
            "simplified_summary": "No data available",
            "parsed_ingredients": [],
            "food_safety_score": 100,
            "detected_chemicals": [],
            "hidden_ingredients": [],
            "total_additives": 0,
            "diseases": [],
            "nutrition_issues": [],
            "recommendation": "Analysis could not be completed. Please try again with valid ingredients.",
            "original_ingredients": request.ingredients,
            "translated_ingredients": request.ingredients,
            "was_translated": False,
            "chemical_summary": {"chemical_score": 0, "density_bonus": 0, "nutrition_bonus": 0, "total_count": 0},
            "nutrition_summary": {"values": {}, "issues_count": 0},
            "ingredient_explanations": [],
            "processing_level": "Unknown",
            "health_warnings": [],
            "health_condition": request.health_condition,
            "additive_interactions": [],
            "error": str(e)
        }


@app.post("/analyze-grocery")
async def analyze_grocery(request: GroceryAnalysisRequest):
    """
    Analyze full grocery list by looping over each item individually.

    Input:
    {
      "items": ["item 1 ingredients", "item 2 ingredients", ...],
      "health_condition": "diabetes" (optional)
    }
    """
    try:
        profile = request.health_mode or request.health_condition
        result = analyze_grocery_items(
            items=request.items,
            health_condition=profile
        )

        total_items = max(0, int(result.get("total_items", 0) or 0))
        high_risk_count = max(0, int(result.get("high_risk_count", 0) or 0))
        safe_items = result.get("safe_items", [])
        if not isinstance(safe_items, list):
            safe_items = []
        overall_grocery_score = max(0, min(100, int(result.get("overall_grocery_score", 0) or 0)))
        item_results = result.get("item_results", [])
        if not isinstance(item_results, list):
            item_results = []

        return {
            "total_items": total_items,
            "high_risk_count": high_risk_count,
            "safe_items": [str(item).strip() for item in safe_items if str(item).strip()],
            "overall_grocery_score": overall_grocery_score,
            "item_results": item_results,
        }
    except Exception:
        return {
            "total_items": 0,
            "high_risk_count": 0,
            "safe_items": [],
            "overall_grocery_score": 0,
            "item_results": [],
        }


# ============================================================================
# FEATURE 2: FOOD COMPARISON ENDPOINT
# ============================================================================
class FoodComparisonRequest(BaseModel):
    """Request model for food comparison."""
    food1_name: Optional[str] = "Food A"
    food1_ingredients: str
    food1_nutrition: Optional[str] = ""
    food2_name: Optional[str] = "Food B"
    food2_ingredients: str
    food2_nutrition: Optional[str] = ""
    health_condition: Optional[str] = None


@app.post("/compare-foods")
async def compare_foods(request: FoodComparisonRequest):
    """
    FEATURE 2: Compare two foods side by side.
    
    Accepts JSON:
    {
      "food1_name": "Cola",
      "food1_ingredients": "water, sugar, caffeine...",
      "food1_nutrition": "Calories 140 Sodium 45mg...",
      "food2_name": "Water",
      "food2_ingredients": "water",
      "food2_nutrition": "",
      "health_condition": "diabetes"
    }
    
    Returns comparison with winner and reasoning.
    """
    print("="*60)
    print("COMPARE FOODS ENDPOINT CALLED")
    print(f"  Food 1: {request.food1_name} - {request.food1_ingredients[:50]}...")
    print(f"  Food 2: {request.food2_name} - {request.food2_ingredients[:50]}...")
    
    try:
        # Analyze both foods
        result1 = analyze_food_comprehensive(
            ingredient_text=request.food1_ingredients,
            nutrition_text=request.food1_nutrition or "",
            health_condition=request.health_condition
        )
        
        result2 = analyze_food_comprehensive(
            ingredient_text=request.food2_ingredients,
            nutrition_text=request.food2_nutrition or "",
            health_condition=request.health_condition
        )
        
        # Build comparison
        comparison = {
            "food1": {
                "name": request.food1_name,
                "risk_level": result1['risk_level'],
                "risk_score": result1['risk_score'],
                "additives_count": result1['total_additives'],
                "processing_level": result1['processing_level'],
                "detected_chemicals": result1['detected_chemicals'],
                "sugar_risk": "High" if any('sugar' in issue.lower() for issue in result1.get('nutrition_issues', [])) else "Low",
                "health_warnings": result1.get('health_warnings', []),
                "additive_interactions": result1.get('additive_interactions', [])
            },
            "food2": {
                "name": request.food2_name,
                "risk_level": result2['risk_level'],
                "risk_score": result2['risk_score'],
                "additives_count": result2['total_additives'],
                "processing_level": result2['processing_level'],
                "detected_chemicals": result2['detected_chemicals'],
                "sugar_risk": "High" if any('sugar' in issue.lower() for issue in result2.get('nutrition_issues', [])) else "Low",
                "health_warnings": result2.get('health_warnings', []),
                "additive_interactions": result2.get('additive_interactions', [])
            },
            "comparison_factors": {
                "risk_score_diff": result1['risk_score'] - result2['risk_score'],
                "additives_diff": result1['total_additives'] - result2['total_additives'],
                "processing_diff": _get_processing_rank(result1['processing_level']) - _get_processing_rank(result2['processing_level'])
            }
        }
        
        # Determine winner
        winner, reason = _determine_winner(comparison, request.health_condition)
        comparison["winner"] = winner
        comparison["reason"] = reason
        
        print(f"\n  Comparison Results:")
        print(f"    Food 1: {request.food1_name} - {result1['risk_level']} ({result1['risk_score']} score)")
        print(f"    Food 2: {request.food2_name} - {result2['risk_level']} ({result2['risk_score']} score)")
        print(f"    Winner: {winner}")
        print("="*60 + "\n")
        
        return comparison
    
    except Exception as e:
        print(f"DEBUG: Error in compare_foods: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(e)}")


def _get_processing_rank(level: str) -> int:
    """Get numerical rank for processing level."""
    ranks = {
        "Whole Food": 1,
        "Minimally Processed": 2,
        "Processed": 3,
        "Ultra Processed": 4
    }
    return ranks.get(level, 0)


def _determine_winner(comparison: Dict, health_condition: Optional[str]) -> tuple:
    """Determine which food is safer based on comparison factors."""
    food1 = comparison['food1']
    food2 = comparison['food2']
    factors = comparison['comparison_factors']
    
    # Start with risk score comparison
    score1 = food1['risk_score']
    score2 = food2['risk_score']
    
    # Build reasons list
    reasons = []
    
    # Check health warnings
    if health_condition:
        warnings1 = len(food1.get('health_warnings', []))
        warnings2 = len(food2.get('health_warnings', []))
        
        if warnings1 < warnings2:
            reasons.append(f"fewer health warnings for {HEALTH_CONDITION_NAMES.get(health_condition, health_condition)}")
        elif warnings2 < warnings1:
            reasons.append(f"more health warnings for {HEALTH_CONDITION_NAMES.get(health_condition, health_condition)}")
    
    # Check additives count
    if factors['additives_diff'] > 0:
        reasons.append("fewer additives")
    elif factors['additives_diff'] < 0:
        reasons.append("more additives")
    
    # Check processing level
    if factors['processing_diff'] > 0:
        reasons.append("lower processing level")
    elif factors['processing_diff'] < 0:
        reasons.append("higher processing level")
    
    # Check sugar risk
    if food1['sugar_risk'] == 'Low' and food2['sugar_risk'] == 'High':
        reasons.append("lower sugar")
    elif food1['sugar_risk'] == 'High' and food2['sugar_risk'] == 'Low':
        reasons.append("higher sugar")
    
    # Check additive interactions
    interactions1 = len(food1.get('additive_interactions', []))
    interactions2 = len(food2.get('additive_interactions', []))
    if interactions1 < interactions2:
        reasons.append("fewer additive interactions")
    elif interactions2 < interactions1:
        reasons.append("more additive interactions")
    
    # Determine winner based on overall score
    if score1 < score2:
        winner = food1['name']
        if not reasons:
            reason = "lower overall risk score"
        else:
            reason = ", ".join(reasons)
    else:
        winner = food2['name']
        if not reasons:
            reason = "lower overall risk score"
        else:
            reason = ", ".join(reasons)
    
    return winner, reason
