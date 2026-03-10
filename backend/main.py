"""
NutriDetect AI - Backend API
AI-powered Food Ingredient Risk Detection Platform
"""

import json
import re
import yaml
import csv
from pathlib import Path
from typing import List, Dict, Optional, Any
from datetime import datetime

from fastapi import FastAPI, HTTPException, Query, Form
from deep_translator import GoogleTranslator


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
    title="NutriDetect AI API",
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
    health_condition: Optional[str] = None  # Personal health mode: diabetes, hypertension, heart_disease, kidney_disease


class NutritionValues(BaseModel):
    calories: Optional[float] = None
    sodium: Optional[float] = None
    fat: Optional[float] = None
    sugar: Optional[float] = None
    protein: Optional[float] = None

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
    
    # Build response with all required fields (STEP 9)
    return {
        'risk_score': risk_result['risk_score'],
        'risk_level': risk_result['risk_level'],
        'detected_chemicals': detected_chemicals,
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
        "MSG", "disodium", "trisodium"
    ],
    "heart_disease": [
        "trans fat", "hydrogenated oil", "partially hydrogenated",
        "saturated fat", "palm oil", "coconut oil", "butter",
        "cholesterol", "lard", "tallow"
    ],
    "kidney_disease": [
        "phosphorus", "phosphate", "sodium", "potassium",
        "calcium", "magnesium", "nitrite", "nitrate"
    ]
}

# Health condition display names
HEALTH_CONDITION_NAMES = {
    "diabetes": "Diabetes",
    "hypertension": "Hypertension",
    "heart_disease": "Heart Disease",
    "kidney_disease": "Kidney Disease"
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
        "name": "NutriDetect AI API",
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
        "answer": "I could not find that chemical in the NutriDetect database. Try searching using an E-number (e.g., E621) or additive name.",
        "type": "not_found"
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
    
    try:
        # Translate ingredients to English if needed
        ingredients_to_analyze = ingredients
        
        if ingredients and language and language != 'en':
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
        
        # Return the required format
        return {
            "risk_level": result.get("risk_level", "Unknown"),
            "detected_chemicals": result.get("detected_chemicals", []),
            "explanation": result.get("recommendation", ""),
            "risk_score": result.get("risk_score", 0),
            "diseases": result.get("diseases", []),
            "nutrition_issues": result.get("nutrition_issues", []),
            "original_ingredients": ingredients,
            "translated_ingredients": ingredients_to_analyze,
            "was_translated": ingredients_to_analyze != ingredients if ingredients else False
        }
    
    except Exception as e:
        print(f"DEBUG: Error in /analyze: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

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
    
    try:
        # Translate ingredients to English if needed
        original_ingredients = request.ingredients
        ingredients_to_analyze = request.ingredients
        
        # If language is not English, translate
        if request.language and request.language != 'en':
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
        
        # Add original and translated ingredients to result for display
        result['original_ingredients'] = original_ingredients
        result['translated_ingredients'] = ingredients_to_analyze
        result['was_translated'] = ingredients_to_analyze != original_ingredients
        
        print(f"\n  Results:")
        print(f"    Risk Level: {result['risk_level']}")
        print(f"    Risk Score: {result['risk_score']}")
        print(f"    Detected Chemicals: {len(result['detected_chemicals'])}")
        print(f"    Processing Level: {result['processing_level']}")
        print(f"    Health Warnings: {len(result['health_warnings'])}")
        print(f"    Additive Interactions: {len(result['additive_interactions'])}")
        print(f"    Diseases: {len(result['diseases'])}")
        print(f"    Nutrition Issues: {len(result['nutrition_issues'])}")
        print("="*60 + "\n")
        
        return result
    
    except Exception as e:
        print(f"DEBUG: Error in analyze_food: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


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
