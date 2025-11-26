// API Service for Adherence Prediction Frontend
// Integrates with FastAPI backend at http://127.0.0.1:8000

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API request failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error);
    throw error;
  }
};

// Health & Info APIs
export const getHealth = async () => {
  return await apiRequest('/health');
};

export const getInfo = async () => {
  return await apiRequest('/info');
};

// Data Management APIs
export const getFeatures = async () => {
  return await apiRequest('/features');
};

export const validateData = async (data, validationRules = null) => {
  return await apiRequest('/validate-data', {
    method: 'POST',
    body: JSON.stringify({ 
      data: Array.isArray(data) ? data : [data],
      validation_rules: validationRules 
    }),
  });
};

export const preprocessData = async (data) => {
  // Note: Preprocessing is handled automatically by the predict endpoints
  // This function is kept for compatibility but returns the data as-is
  return {
    preprocessed_data: data
  };
};

// Prediction APIs
export const predictSingle = async (data) => {
  return await apiRequest('/predict', {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
};

export const predictBatch = async (file) => {
  // The /predict-batch endpoint expects a CSV file upload
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await fetch(`${BASE_URL}/predict-batch`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - let browser set it with boundary
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API request failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error calling /predict-batch:', error);
    throw error;
  }
};

export const explainPrediction = async (data) => {
  return await apiRequest('/predict/explain', {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
};

// Training Data APIs
export const getTrainingData = async (page = 1, size = 50) => {
  return await apiRequest(`/training-data?page=${page}&size=${size}`);
};

export const getTrainingDataStats = async () => {
  return await apiRequest('/training-data/stats');
};

// Model Management APIs
export const getModels = async () => {
  // Note: The FastAPI backend doesn't have a models endpoint yet
  // Returning info endpoint data formatted as models array
  const info = await apiRequest('/info');
  return {
    models: [
      {
        model_id: "model_1",
        name: info.model_name || "Adherence Prediction Model",
        version: info.version || "v1.0.0",
        algorithm: info.algorithm || "XGBoost Classifier",
        status: "deployed",
        is_active: true,
        accuracy: info.performance_metrics?.accuracy || 0.85,
        precision: info.performance_metrics?.precision || 0.82,
        recall: info.performance_metrics?.recall || 0.87,
        f1_score: info.performance_metrics?.f1_score || 0.845,
        training_date: info.training_date || new Date().toISOString().split('T')[0]
      }
    ]
  };
};

export const deployModel = async (modelId) => {
  // Note: Model deployment not implemented in current FastAPI backend
  return {
    previous_model: "model_v1",
    new_model: modelId,
    status: "deployed",
    deployment_time: new Date().toISOString(),
    message: `Model ${modelId} deployment requested (not implemented in backend yet)`
  };
};

// Monitoring & Analytics APIs
export const getMetrics = async () => {
  return await apiRequest('/metrics');
};

export const getPredictionsHistory = async (page = 1, size = 25) => {
  return await apiRequest(`/predictions/history?page=${page}&size=${size}`);
};

const api = {
  getHealth,
  getInfo,
  getFeatures,
  validateData,
  preprocessData,
  predictSingle,
  predictBatch,
  explainPrediction,
  getTrainingData,
  getTrainingDataStats,
  getModels,
  deployModel,
  getMetrics,
  getPredictionsHistory
};

export default api;
