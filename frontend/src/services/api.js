import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

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

export const getChemicals = async () => {
  const response = await api.get('/chemicals');
  return response.data;
};

export default api;
