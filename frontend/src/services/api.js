import axios from 'axios';

const API_URL = 'http://127.0.0.1:8001';

const api = axios.create({
  baseURL: API_URL
});

// Analyze nutrition facts text
export const analyzeNutrition = async (nutritionText) => {
  const response = await api.post('/analyze-nutrition', {
    nutrition_text: nutritionText
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
