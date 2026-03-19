import axios from 'axios';
import { getApiUrl } from './apiConfig';

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL
});

// Analyze food using FormData (multilingual support)
export const analyzeFood = async (ingredients, language = 'auto') => {
  const formData = new FormData();
  formData.append('ingredients', ingredients);
  formData.append('language', language);
  
  const response = await api.post('/analyze', formData);
  return response.data;
};

// Analyze nutrition facts text
export const analyzeNutrition = async (nutritionText) => {
  const response = await api.post('/analyze-nutrition', {
    nutrition_text: nutritionText
  });

  return response.data;
};

// Comprehensive food analysis using database-driven detection (legacy)
export const analyzeFoodLegacy = async (ingredients, nutritionText = '') => {
  const response = await api.post('/analyze-food', {
    ingredients: ingredients,
    nutrition_text: nutritionText
  });

  return response.data;
};

// ============================================================================
// NEW API FUNCTIONS FOR ADVANCED FEATURES
// ============================================================================

/**
 * Analyze food with all advanced features:
 * - AI Ingredient Explanations
 * - Personal Health Mode
 * - Processing Level Detection (NOVA)
 * - Smart Additive Interaction Warnings
 */
export const analyzeFoodWithHealthMode = async (ingredients, nutritionText = '', language = 'auto', healthCondition = null) => {
  const response = await api.post('/analyze-food', {
    ingredients: ingredients,
    nutrition_text: nutritionText || '',
    language: language,
    health_condition: healthCondition
  });

  return response.data;
};

/**
 * Compare two foods side by side
 */
export const compareFoods = async (
  food1Name, food1Ingredients, food1Nutrition = '',
  food2Name, food2Ingredients, food2Nutrition = '',
  healthCondition = null
) => {
  const response = await api.post('/compare-foods', {
    food1_name: food1Name,
    food1_ingredients: food1Ingredients,
    food1_nutrition: food1Nutrition || '',
    food2_name: food2Name,
    food2_ingredients: food2Ingredients,
    food2_nutrition: food2Nutrition || '',
    health_condition: healthCondition
  });

  return response.data;
};

/**
 * Analyze full grocery list (multiple items/products).
 */
export const analyzeGroceryList = async (items = [], healthCondition = null) => {
  const response = await api.post('/analyze-grocery', {
    items,
    health_condition: healthCondition,
    health_mode: healthCondition
  });

  return response.data;
};

/**
 * Get personalized daily nutrition goals.
 */
export const getDailyNutritionGoals = async (age = null, weight = null, goal = 'maintain') => {
  const response = await api.post('/daily-goals', {
    age,
    weight,
    goal
  });

  return response.data;
};

/**
 * Get weekly meal plan based on user goal, diet type, and budget.
 * @param {string} goal - 'weight loss', 'weight gain', or 'maintain'
 * @param {string} dietType - 'veg', 'non-veg', or 'eggetarian'
 * @param {string} budget - 'low', 'medium', or 'high'
 */
export const getWeeklyMealPlan = async (goal = 'maintain', dietType = 'veg', budget = 'medium') => {
  const response = await api.post('/weekly-meal-plan', {
    goal,
    diet_type: dietType,
    budget
  });

  return response.data;
};

export const getChemicals = async (search = '', riskLevel = '', category = '', limit = 100) => {
  const params = new URLSearchParams();
  
  if (search) params.append('search', search);
  if (riskLevel && riskLevel !== 'all') params.append('risk_level', riskLevel);
  if (category && category !== 'all') params.append('category', category);
  params.append('limit', limit.toString());
  
  const response = await api.get(`/chemicals?${params.toString()}`);
  return response.data;
};

export default api;
