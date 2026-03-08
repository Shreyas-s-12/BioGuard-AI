"""
NutriGuard AI - Backend API
Smart Food Safety & Nutrition Risk Analysis Platform
"""

import json
import re
import yaml
import csv
from pathlib import Path
from typing import List, Dict, Optional, Any
from datetime import datetime

from fastapi import FastAPI, HTTPException, Query

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
        print(f"DEBUG: Loaded {len(chemicals)} chemicals from CSV")
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
    title="NutriGuard AI API",
    description="Smart Food Safety & Nutrition Risk Analysis Platform",
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
        "possible_long_term_health_effects": health_effects,
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
            "possible_long_term_health_effects": [],
            "analysis_summary": "Unable to process request. Please try again."
        }
    )

# API Routes
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "NutriGuard AI API",
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
      "possible_long_term_health_effects": ["hypertension", "type 2 diabetes", "headaches"],
      "analysis_summary": "This product contains artificial sweeteners..."
    }
    """
    print("\n" + "="*50)
    print("DEBUG: Received analyze-nutrition request")
    print(f"DEBUG: nutrition_text length: {len(request.nutrition_text)}")
    print("="*50 + "\n")
    
    try:
        # Run factor analysis
        analysis_result = analyze_factors(request.nutrition_text)
        
        print("DEBUG: Analysis complete:")
        print(f"  - Detected Factors: {analysis_result['detected_factors']}")
        print(f"  - Health Effects: {analysis_result['possible_long_term_health_effects']}")
        print("="*50 + "\n")
        
        return analysis_result
    
    except Exception as e:
        print(f"DEBUG: Error in analyze_nutrition: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
