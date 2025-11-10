// API Service for Adherence Prediction Frontend
// This service fetches data from local JSON files (mock API)
// In production, replace fetch calls with actual API endpoints

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

// Helper function to fetch JSON data
const fetchJSON = async (endpoint) => {
  try {
    const response = await fetch(`/data/${endpoint}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};

// Health & Info APIs
export const getHealth = async () => {
  return await fetchJSON('health');
};

export const getInfo = async () => {
  return await fetchJSON('info');
};

// Data Management APIs
export const getFeatures = async () => {
  return await fetchJSON('features');
};

export const validateData = async (data) => {
  // TODO: Implement actual validation logic with API
  // For now, return mock validation response
  return {
    is_valid: true,
    missing_columns: [],
    invalid_values: [],
    message: 'Data validation successful'
  };
};

export const preprocessData = async (data) => {
  // TODO: Implement actual preprocessing with API
  // For now, return the same data
  return {
    preprocessed_data: data
  };
};

// Prediction APIs
export const predictSingle = async (data) => {
  // TODO: Implement actual prediction API call
  // For now, return mock prediction
  return {
    prediction: "Good Subject",
    probability: 0.78,
    class_label: "Completed treatment",
    confidence: "high",
    timestamp: new Date().toISOString()
  };
};

export const predictBatch = async (dataArray) => {
  // TODO: Implement actual batch prediction API call
  // For now, return mock batch predictions
  return {
    predictions: dataArray.map((data, index) => ({
      MASK_ID: data.MASK_ID || index + 1,
      prediction: Math.random() > 0.5 ? "Good Subject" : "Bad Subject",
      probability: (0.6 + Math.random() * 0.3).toFixed(2),
      class_label: Math.random() > 0.5 ? "Completed treatment" : "Did not complete treatment",
      confidence: Math.random() > 0.7 ? "high" : "medium",
      timestamp: new Date().toISOString()
    })),
    summary: {
      total_records: dataArray.length,
      good_subjects: Math.floor(dataArray.length * 0.65),
      bad_subjects: Math.floor(dataArray.length * 0.35)
    }
  };
};

export const explainPrediction = async (data, predictionId) => {
  // TODO: Implement actual explanation API call
  // For now, return mock explanation
  return {
    prediction: "Good Subject",
    probability: 0.78,
    explanation: {
      top_positive_features: [
        { feature: "PERFORMANCE_ID", value: 1, impact: 0.15 },
        { feature: "stable_weigh", value: 2, impact: 0.12 },
        { feature: "agecat", value: 1, impact: 0.08 }
      ],
      top_negative_features: [
        { feature: "prior_chemo", value: 0, impact: -0.05 },
        { feature: "Histologic_grade", value: 3, impact: -0.03 }
      ],
      shap_values: {
        base_value: 0.65,
        features: {
          PERFORMANCE_ID: 0.15,
          stable_weigh: 0.12,
          agecat: 0.08
        }
      }
    }
  };
};

// Training Data APIs
export const getTrainingData = async (page = 1, size = 10) => {
  // TODO: Implement pagination with actual API
  return await fetchJSON('training-data');
};

export const getTrainingDataStats = async () => {
  return await fetchJSON('training-data-stats');
};

// Model Management APIs
export const getModels = async () => {
  return await fetchJSON('models');
};

export const deployModel = async (modelId) => {
  // TODO: Implement actual model deployment API call
  // For now, return mock deployment response
  return {
    previous_model: "model_v1",
    new_model: modelId,
    status: "deployed",
    deployment_time: new Date().toISOString(),
    message: `Model ${modelId} successfully deployed as active model`
  };
};

// Monitoring & Analytics APIs
export const getMetrics = async () => {
  return await fetchJSON('metrics');
};

export const getPredictionsHistory = async (page = 1, size = 10) => {
  // TODO: Implement pagination with actual API
  return await fetchJSON('predictions-history');
};

export default {
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
