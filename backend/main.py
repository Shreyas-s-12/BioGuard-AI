"""
NutriGuard AI - Backend API
Smart Food Safety & Chemical Risk Awareness Platform
"""

import os
import json
import csv
import re
import yaml
from pathlib import Path
from typing import List, Dict, Optional, Any
from io import StringIO, BytesIO

import numpy as np
from PIL import Image
import pytesseract

# Configure Tesseract OCR path (Windows)
# Ensure Tesseract is installed at: C:\Program Files\Tesseract-OCR\tesseract.exe
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import datetime

# Load configuration
CONFIG_PATH = Path(__file__).parent / "config.yaml"
with open(CONFIG_PATH, 'r') as f:
    CONFIG = yaml.safe_load(f)

# Data paths
DATA_DIR = Path(__file__).parent / "data"
CHEMICALS_CSV = DATA_DIR / "chemicals.csv"
SUGAR_JSON = DATA_DIR / "sugar_aliases.json"

# Load chemicals database
def load_chemicals() -> List[Dict]:
    """Load chemicals from CSV file"""
    chemicals = []
    with open(CHEMICALS_CSV, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            chemicals.append(row)
    return chemicals

# Load sugar aliases
def load_sugar_aliases() -> Dict:
    """Load sugar aliases from JSON file"""
    with open(SUGAR_JSON, 'r', encoding='utf-8') as f:
        return json.load(f)

# Initialize data
CHEMICALS_DB = load_chemicals()
SUGAR_DATA = load_sugar_aliases()

# Create search index for chemicals
def create_chemical_index() -> Dict[str, List[Dict]]:
    """Create searchable index for chemicals by name and aliases"""
    index = {}
    for chemical in CHEMICALS_DB:
        # Index by chemical name
        name_lower = chemical['chemical_name'].lower()
        if name_lower not in index:
            index[name_lower] = []
        index[name_lower].append(chemical)
        
        # Index by E-number
        e_num = chemical.get('e_number', '').lower()
        if e_num:
            if e_num not in index:
                index[e_num] = []
            index[e_num].append(chemical)
        
        # Index by aliases
        aliases = chemical.get('aliases', '').split(',')
        for alias in aliases:
            alias = alias.strip().lower()
            if alias and alias not in index:
                index[alias] = []
            if chemical not in index.get(alias, []):
                index[alias].append(chemical)
    
    return index

CHEMICAL_INDEX = create_chemical_index()

# Create sugar aliases index
def create_sugar_index() -> set:
    """Create searchable index for sugar aliases"""
    sugar_aliases = set()
    for alias in SUGAR_DATA['sugar_aliases']:
        sugar_aliases.add(alias.lower())
    return sugar_aliases

SUGAR_INDEX = create_sugar_index()

app = FastAPI(
    title="NutriGuard AI API",
    description="Smart Food Safety & Chemical Risk Awareness Platform",
    version="1.0.0"
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
class AnalysisRequest(BaseModel):
    ingredients: Optional[str] = None
    nutrition: Optional[Dict[str, Any]] = None

class ChemicalDetection(BaseModel):
    chemical_name: str
    e_number: str
    category: str
    purpose: str
    risk_level: str
    health_concerns: str
    safe_limit: str
    detected_in: str

class NutritionIssue(BaseModel):
    nutrient: str
    value: float
    unit: str
    risk_level: str
    concern: str

class AnalysisReport(BaseModel):
    timestamp: str
    ocr_text: Optional[str]
    detected_chemicals: List[ChemicalDetection]
    hidden_sugars: List[str]
    nutrition_issues: List[NutritionIssue]
    risk_score: int
    risk_level: str
    sugar_risk_score: int
    fat_risk_score: int
    sodium_risk_score: int
    chemical_risk_score: int
    recommendation: str
    processing_level: str

# OCR Service
def extract_text_from_image(image_data: bytes) -> str:
    """Extract text from food label image using Tesseract OCR"""
    try:
        image = Image.open(BytesIO(image_data))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Preprocess image for better OCR
        # Apply basic image processing
        img_array = np.array(image)
        
        # Use Tesseract to extract text
        text = pytesseract.image_to_string(image, lang='eng')
        
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")

# Ingredient Parser
def parse_ingredients(text: str) -> List[str]:
    """Parse ingredients list from OCR text"""
    # Find ingredients section
    ingredients_pattern = r'(?:ingredients?|composition)[:\s]*(.+?)(?:nutrition|nutrient|warning|allergen|$)'
    match = re.search(ingredients_pattern, text, re.IGNORECASE | re.DOTALL)
    
    if match:
        ingredients_text = match.group(1)
    else:
        # Use entire text as potential ingredients
        ingredients_text = text
    
    # Split by common separators
    ingredients = re.split(r'[,;•\n\r]+', ingredients_text)
    
    # Clean and filter
    parsed = []
    for ing in ingredients:
        ing = ing.strip().lower()
        # Remove numbers and special characters at start
        ing = re.sub(r'^[\d\.\)\(]+\s*', '', ing)
        if len(ing) > 1:
            parsed.append(ing)
    
    return parsed

# Chemical Detection
def detect_chemicals(ingredients: List[str]) -> List[ChemicalDetection]:
    """Detect chemicals in ingredients list"""
    detected = []
    
    for ingredient in ingredients:
        ingredient_lower = ingredient.lower()
        
        # Search in chemical index
        for key, chemicals in CHEMICAL_INDEX.items():
            if key in ingredient_lower or ingredient_lower in key:
                for chem in chemicals:
                    # Check if already detected
                    if not any(d.chemical_name == chem['chemical_name'] for d in detected):
                        detected.append(ChemicalDetection(
                            chemical_name=chem['chemical_name'],
                            e_number=chem['e_number'],
                            category=chem['category'],
                            purpose=chem['purpose'],
                            risk_level=chem['risk_level'],
                            health_concerns=chem['health_concerns'],
                            safe_limit=chem['safe_limit'],
                            detected_in=ingredient
                        ))
    
    return detected

# Hidden Sugar Detection
def detect_hidden_sugars(ingredients: List[str]) -> List[str]:
    """Detect hidden sugars in ingredients"""
    detected = []
    
    for ingredient in ingredients:
        ingredient_lower = ingredient.lower()
        
        for sugar_alias in SUGAR_INDEX:
            if sugar_alias in ingredient_lower:
                if sugar_alias not in detected:
                    detected.append(sugar_alias)
                break
    
    return detected

# Nutrition Analysis
def analyze_nutrition(nutrition_data: Dict[str, Any]) -> List[NutritionIssue]:
    """Analyze nutrition data for risks"""
    issues = []
    
    thresholds = CONFIG['nutrition_thresholds']
    
    # Analyze Sugar
    if 'sugar' in nutrition_data:
        sugar = float(nutrition_data['sugar'])
        if sugar > thresholds['sugar']['high']:
            issues.append(NutritionIssue(
                nutrient='sugar',
                value=sugar,
                unit='g',
                risk_level='High',
                concern=f'Sugar content {sugar}g exceeds high threshold {thresholds["sugar"]["high"]}g'
            ))
        elif sugar > thresholds['sugar']['medium']:
            issues.append(NutritionIssue(
                nutrient='sugar',
                value=sugar,
                unit='g',
                risk_level='Moderate',
                concern=f'Sugar content {sugar}g is above moderate threshold {thresholds["sugar"]["medium"]}g'
            ))
    
    # Analyze Sodium
    if 'sodium' in nutrition_data:
        sodium = float(nutrition_data['sodium'])
        if sodium > thresholds['sodium']['high']:
            issues.append(NutritionIssue(
                nutrient='sodium',
                value=sodium,
                unit='mg',
                risk_level='High',
                concern=f'Sodium content {sodium}mg exceeds high threshold {thresholds["sodium"]["high"]}mg'
            ))
        elif sodium > thresholds['sodium']['medium']:
            issues.append(NutritionIssue(
                nutrient='sodium',
                value=sodium,
                unit='mg',
                risk_level='Moderate',
                concern=f'Sodium content {sodium}mg is above moderate threshold {thresholds["sodium"]["medium"]}mg'
            ))
    
    # Analyze Saturated Fat
    if 'saturated_fat' in nutrition_data:
        sat_fat = float(nutrition_data['saturated_fat'])
        if sat_fat > thresholds['saturated_fat']['high']:
            issues.append(NutritionIssue(
                nutrient='saturated_fat',
                value=sat_fat,
                unit='g',
                risk_level='High',
                concern=f'Saturated fat {sat_fat}g exceeds high threshold {thresholds["saturated_fat"]["high"]}g'
            ))
        elif sat_fat > thresholds['saturated_fat']['medium']:
            issues.append(NutritionIssue(
                nutrient='saturated_fat',
                value=sat_fat,
                unit='g',
                risk_level='Moderate',
                concern=f'Saturated fat {sat_fat}g is above moderate threshold {thresholds["saturated_fat"]["medium"]}g'
            ))
    
    # Analyze Trans Fat
    if 'trans_fat' in nutrition_data:
        trans_fat = float(nutrition_data['trans_fat'])
        if trans_fat > thresholds['trans_fat']['medium']:
            issues.append(NutritionIssue(
                nutrient='trans_fat',
                value=trans_fat,
                unit='g',
                risk_level='High',
                concern=f'Trans fat {trans_fat}g exceeds safe threshold'
            ))
        elif trans_fat > thresholds['trans_fat']['low']:
            issues.append(NutritionIssue(
                nutrient='trans_fat',
                value=trans_fat,
                unit='g',
                risk_level='Moderate',
                concern=f'Trans fat {trans_fat}g should be avoided'
            ))
    
    # Analyze Calories
    if 'calories' in nutrition_data:
        calories = float(nutrition_data['calories'])
        if calories > thresholds['calories']['high']:
            issues.append(NutritionIssue(
                nutrient='calories',
                value=calories,
                unit='kcal',
                risk_level='Moderate',
                concern=f'High calorie content {calories}kcal per serving'
            ))
    
    return issues

# Risk Scoring
def calculate_risk_scores(
    detected_chemicals: List[ChemicalDetection],
    hidden_sugars: List[str],
    nutrition_issues: List[NutritionIssue]
) -> Dict[str, Any]:
    """Calculate comprehensive risk scores"""
    
    weights = CONFIG['risk_weights']
    chem_weights = CONFIG['chemical_risk_weights']
    processing_weights = CONFIG['processing_levels']
    
    # Sugar risk (0-100)
    sugar_risk_score = min(100, len(hidden_sugars) * 20)
    if any(n.nutrient == 'sugar' for n in nutrition_issues):
        sugar_issue = next((n for n in nutrition_issues if n.nutrient == 'sugar'), None)
        if sugar_issue:
            if sugar_issue.risk_level == 'High':
                sugar_risk_score = 100
            elif sugar_issue.risk_level == 'Moderate':
                sugar_risk_score = max(sugar_risk_score, 70)
    
    # Fat risk (0-100)
    fat_risk_score = 0
    if any(n.nutrient == 'saturated_fat' for n in nutrition_issues):
        fat_issue = next((n for n in nutrition_issues if n.nutrient == 'saturated_fat'), None)
        if fat_issue:
            if fat_issue.risk_level == 'High':
                fat_risk_score = 100
            elif fat_issue.risk_level == 'Moderate':
                fat_risk_score = 70
    if any(n.nutrient == 'trans_fat' for n in nutrition_issues):
        fat_risk_score = max(fat_risk_score, 80)
    
    # Sodium risk (0-100)
    sodium_risk_score = 0
    if any(n.nutrient == 'sodium' for n in nutrition_issues):
        sodium_issue = next((n for n in nutrition_issues if n.nutrient == 'sodium'), None)
        if sodium_issue:
            if sodium_issue.risk_level == 'High':
                sodium_risk_score = 100
            elif sodium_issue.risk_level == 'Moderate':
                sodium_risk_score = 70
    
    # Chemical risk (0-100)
    chemical_risk_score = 0
    high_risk_count = sum(1 for c in detected_chemicals if c.risk_level == 'High')
    moderate_risk_count = sum(1 for c in detected_chemicals if c.risk_level == 'Moderate')
    low_risk_count = sum(1 for c in detected_chemicals if c.risk_level in ['Low', 'Minimal'])
    
    chemical_risk_score = (
        high_risk_count * 30 +
        moderate_risk_count * 15 +
        low_risk_count * 5
    )
    chemical_risk_score = min(100, chemical_risk_score)
    
    # Determine processing level
    if chemical_risk_score >= 60 or len(detected_chemicals) >= 5:
        processing_level = 'ultra_processed'
        processing_risk = processing_weights['ultra_processed']
    elif chemical_risk_score >= 30 or len(detected_chemicals) >= 2:
        processing_level = 'processed'
        processing_risk = processing_weights['processed']
    elif chemical_risk_score >= 10 or len(detected_chemicals) >= 1:
        processing_level = 'minimally_processed'
        processing_risk = processing_weights['minimally_processed']
    else:
        processing_level = 'whole_food'
        processing_risk = processing_weights['whole_food']
    
    # Calculate overall score (weighted average)
    total_weight = (
        weights['sugar_risk'] +
        weights['fat_risk'] +
        weights['sodium_risk'] +
        weights['chemical_risk'] +
        weights['processing_risk']
    )
    
    overall_score = int((
        sugar_risk_score * weights['sugar_risk'] +
        fat_risk_score * weights['fat_risk'] +
        sodium_risk_score * weights['sodium_risk'] +
        chemical_risk_score * weights['chemical_risk'] +
        processing_risk * weights['processing_risk']
    ) / total_weight)
    
    # Determine risk level
    if overall_score >= 70:
        risk_level = 'High'
    elif overall_score >= 40:
        risk_level = 'Moderate'
    else:
        risk_level = 'Low'
    
    return {
        'risk_score': overall_score,
        'risk_level': risk_level,
        'sugar_risk_score': sugar_risk_score,
        'fat_risk_score': fat_risk_score,
        'sodium_risk_score': sodium_risk_score,
        'chemical_risk_score': chemical_risk_score,
        'processing_level': processing_level,
        'processing_risk': processing_risk
    }

# Generate Recommendation
def generate_recommendation(
    risk_level: str,
    detected_chemicals: List[ChemicalDetection],
    hidden_sugars: List[str],
    nutrition_issues: List[NutritionIssue]
) -> str:
    """Generate food safety recommendation"""
    
    recommendations = []
    
    if risk_level == 'High':
        recommendations.append("⚠️ High risk product detected. Consider avoiding frequent consumption.")
        
        if hidden_sugars:
            recommendations.append(f"Contains hidden sugars: {', '.join(hidden_sugars[:5])}")
        
        high_risk_chemicals = [c for c in detected_chemicals if c.risk_level == 'High']
        if high_risk_chemicals:
            chem_names = [c.chemical_name for c in high_risk_chemicals[:3]]
            recommendations.append(f"High-risk additives detected: {', '.join(chem_names)}")
        
    elif risk_level == 'Moderate':
        recommendations.append("⚡ Moderate risk detected. Consume in moderation.")
        
        if hidden_sugars:
            recommendations.append("Contains hidden sugars - check labels carefully.")
        
    else:
        recommendations.append("✅ Relatively safe product with minimal additives.")
        
        if not detected_chemicals and not hidden_sugars:
            recommendations.append("No concerning additives or hidden sugars detected.")
    
    # Add specific warnings
    if any(c.risk_level == 'High' for c in detected_chemicals):
        recommendations.append("Contains potentially harmful additives. Research before consuming.")
    
    if len(hidden_sugars) >= 3:
        recommendations.append("High hidden sugar content - may affect blood sugar levels.")
    
    if any(n.nutrient == 'sodium' and n.risk_level == 'High' for n in nutrition_issues):
        recommendations.append("Very high sodium content - may affect blood pressure.")
    
    if any(n.nutrient == 'trans_fat' for n in nutrition_issues):
        recommendations.append("Contains trans fats - avoid for heart health.")
    
    return " ".join(recommendations)

# API Routes
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "NutriGuard AI API",
        "version": "1.0.0",
        "description": "Smart Food Safety & Chemical Risk Awareness Platform",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "chemicals_database": len(CHEMICALS_DB),
        "sugar_aliases": len(SUGAR_INDEX)
    }

@app.post("/api/analyze")
async def analyze_food(
    file: UploadFile = File(None),
    ingredients: str = None,
    nutrition: str = None
):
    """Analyze food for chemicals and nutrition risks"""
    
    ocr_text = None
    nutrition_data = None
    
    # Process image if provided
    if file:
        try:
            image_data = await file.read()
            ocr_text = extract_text_from_image(image_data)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to process image: {str(e)}")
    
    # Use provided ingredients or parse from OCR
    if ingredients:
        parsed_ingredients = [i.strip() for i in ingredients.split(',')]
    elif ocr_text:
        parsed_ingredients = parse_ingredients(ocr_text)
    else:
        raise HTTPException(status_code=400, detail="No ingredients or image provided")
    
    # Parse nutrition data if provided
    if nutrition:
        try:
            nutrition_data = json.loads(nutrition)
        except:
            nutrition_data = None
    
    # Detect chemicals
    detected_chemicals = detect_chemicals(parsed_ingredients)
    
    # Detect hidden sugars
    hidden_sugars = detect_hidden_sugars(parsed_ingredients)
    
    # Analyze nutrition
    nutrition_issues = analyze_nutrition(nutrition_data or {})
    
    # Calculate risk scores
    risk_scores = calculate_risk_scores(detected_chemicals, hidden_sugars, nutrition_issues)
    
    # Generate recommendation
    recommendation = generate_recommendation(
        risk_scores['risk_level'],
        detected_chemicals,
        hidden_sugars,
        nutrition_issues
    )
    
    # Build response
    report = {
        "timestamp": datetime.now().isoformat(),
        "ocr_text": ocr_text,
        "extracted_ingredients": parsed_ingredients,
        "detected_chemicals": [c.dict() for c in detected_chemicals],
        "hidden_sugars": hidden_sugars,
        "nutrition_issues": [n.dict() for n in nutrition_issues],
        "risk_score": risk_scores['risk_score'],
        "risk_level": risk_scores['risk_level'],
        "sugar_risk_score": risk_scores['sugar_risk_score'],
        "fat_risk_score": risk_scores['fat_risk_score'],
        "sodium_risk_score": risk_scores['sodium_risk_score'],
        "chemical_risk_score": risk_scores['chemical_risk_score'],
        "processing_level": risk_scores['processing_level'],
        "recommendation": recommendation
    }
    
    return report

@app.get("/api/chemicals")
async def get_chemicals(category: str = None, risk_level: str = None):
    """Get chemicals from database with optional filters"""
    
    filtered = CHEMICALS_DB
    
    if category:
        filtered = [c for c in filtered if c['category'].lower() == category.lower()]
    
    if risk_level:
        filtered = [c for c in filtered if c['risk_level'].lower() == risk_level.lower()]
    
    return {
        "total": len(filtered),
        "chemicals": filtered[:100]  # Limit to 100 for performance
    }

@app.get("/api/categories")
async def get_categories():
    """Get all chemical categories"""
    categories = set()
    for chem in CHEMICALS_DB:
        categories.add(chem['category'])
    return {"categories": sorted(list(categories))}

@app.post("/api/ocr")
async def perform_ocr(file: UploadFile = File(...)):
    """Perform OCR on uploaded image"""
    
    try:
        image_data = await file.read()
        text = extract_text_from_image(image_data)
        
        # Parse ingredients from OCR text
        ingredients = parse_ingredients(text)
        
        return {
            "ocr_text": text,
            "extracted_ingredients": ingredients
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
