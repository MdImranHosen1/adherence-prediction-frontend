# **Adherence Prediction Model Service - API Specification**

This document describes the expected REST API endpoints for the **Adherence Prediction Model Service**. The service provides endpoints for model health monitoring, prediction, data management, training, and analytics.

## **1\. Core Health & Info APIs**

Before interacting with the model or performing any prediction, these APIs help ensure that the service is running properly and that the currently deployed model is active and healthy. They also provide basic model metadata such as name, version, training details, and feature information - which are useful for verification and monitoring purposes.

- **GET /health**  
    Checks the overall health of the API service and confirms that the model is active and ready to receive requests.

**Response:**
```json
{

"status": "healthy",

"model_status": "active",

"timestamp": "2024-01-15T10:30:00Z",

}
```

- **GET /info**  
    Returns general model metadata, including model name, training date, accuracy, and feature details.

**Response:**
```json
{

"model_name": "AdherencePredictionModel",

"version": "v1.2.0",

"training_date": "2025-10-25",

"algorithm": "XGBoost Classifier",

"performance_metrics": {

"accuracy": 0.85,

"precision": 0.82,

"recall": 0.87,

"f1_score": 0.845,

"roc_auc": 0.91

},

"features": \[

"PERFORMANCE_ID", "Hx_oth_cancer", "stable_weigh", "No_cardiact_condition", "agecat", ...

\],

"target": "offtrt_reason",

"description": "Predicts whether a patient will complete treatment (1) or not (0)."

}
```

&nbsp;

## **2\. Data Management APIs**

Before sending data to the prediction endpoint, it's crucial to ensure that the data is valid and properly formatted. These APIs help in validating the input data, checking for missing or invalid values, and applying the same preprocessing steps (such as scaling or encoding) that were used during model training. This guarantees that the data is eligible and ready for accurate prediction.

- **POST /validate-data**  
    Validates input data before prediction. It checks for missing columns, invalid values, or incorrect data types and returns a validation report.

**Request:**
```json
{
    "data": [
        {
        "PERFORMANCE_ID": 1,
        "agecat": 1,
        "...": "..."
        }
    ],
    "validation_rules": {
    "strict_mode": true
    }
}
```

&nbsp;

**Response:**
```json
{
    "is_valid": false,
    "missing_columns": ["stable_weigh"],
    "invalid_values": [],
}
```

&nbsp;

- **GET /features**  
    Returns the list of all model features, their data types, and allowed categorical values. This helps ensure correct input formatting for prediction or training.

**Response:**

```json
{
    "features": [
        {
            "name": "PERFORMANCE_ID",
            "type": "integer",
            "description": "ECOG Performance status (0-2)",
            "allowed_values": [0, 1, 2],
            "required": true,
            "categorical": true
        },
        {
            "name": "agecat",
            "type": "integer",
            "description": "Age category",
            "allowed_values": [1, 2],
            "required": true,
            "categorical": true
        },
        {
            "name": "num_lymph_node_examined",
            "type": "integer",
            "description": "Number of lymph nodes examined",
            "min_value": 0,
            "max_value": 100,
            "required": true,
            "categorical": false
        }
    ],
    "total_features": 35,
    "categorical_features": 25,
    "numerical_features": 10
}
```
```

&nbsp;

- **POST /preprocess**  
    Provides a preprocessing utility that applies the same transformations (scaling, encoding, etc.) used during model training to new input data.

**Request:**

```json
{
    "data": [
        {
            "PERFORMANCE_ID": 1,
            "agecat": 1,
            "Hx_oth_cancer": 0,
            "stable_weigh": 2,
            "No_cardiact_condition": 1,
            "num_lymph_node_examined": 5
        }
    ]
}
```

&nbsp;

**Response:**

{

"preprocessed_data": \[

{

"PERFORMANCE_ID": 1,

"agecat": 1,

"...": "..."

}

\]

}

&nbsp;

## **3\. Prediction APIs**

Once the input data has been validated and preprocessed, these APIs are used to generate predictions from the active adherence model. They handle both single-patient and batch prediction requests, and also provide prediction explanations (feature importance) to understand which variables influenced the outcome the most.

- **POST /predict**  
    Accepts a single patient's feature data (in JSON format) and returns the predicted adherence result along with the probability score.

**Request:**

{

"data": {

"PERFORMANCE_ID": 1,

"Hx_oth_cancer": 1,

"stable_weigh": 2,

"examed_by_radiation_oncologist": 1,

"bilateral_renal_function": 1,

"No_cardiact_condition": 1,

"prior_chemo": 0,

"prior_radiation": 0,

"Gastro_esophageal_junction": 0,

"cardia": 0,

"fundus": 0,

"body_corpus": 1,

"antrum": 0,

"pylorus_pyloric_channel": 0,

"greater_curvature": 0,

"lesser_curvature": 0,

"stomach_NOS": 0,

"Histologic_grade": 3,

"num_lymph_node_examined": 7,

"num_pos_lymph_node": 0,

"T_stage": 2,

"N_stage": 0,

"M_stage": 0,

"T2N0M0_spec": 2,

"PD_location": null,

"ETHNIC_ID": 1,

"SEX_ID": 1,

"RACE_ID": 1,

"TREAT_ASSIGNED": 2,

"STRATUM_GRP_ID": 1,

"agecat": 1

}

}

&nbsp;

**Response**:

{

"prediction": "Good Subject",

"probability": 0.78,

"class_label": "Completed treatment",

"confidence": "high",

"timestamp": "2024-01-15T10:35:00Z"

}

- **POST /predict-batch**  
    Accepts multiple patient records (as a JSON array or CSV file) and returns predictions for all records, including overall summary counts.

**Request:**

{

"data": \[

{

"MASK_ID": 1,

"PERFORMANCE_ID": 1,

"agecat": 1,

"...": "..."

},

{

"MASK_ID": 2,

"PERFORMANCE_ID": 0,

"agecat": 2,

"...": "..."

}

\]

}

&nbsp;

**Response:**

{

"predictions": \[

{

"MASK_ID": 1,

"prediction": "Good Subject",

"probability": 0.78,

"class_label": "Completed treatment",

"confidence": "high",

"timestamp": "2024-01-15T10:35:00Z"

},

{

"MASK_ID": 2,

"prediction": "Bad Subject",

"probability": 0.78,

"class_label": "Completed treatment",

"confidence": "high",

"timestamp": "2024-01-15T10:35:00Z"

}

\],

"summary": {

"total_records": 2,

"good_subjects": 1,

"bad_subjects": 1

}

}

&nbsp;

- **POST /explain**  
    Generates an explanation for a specific prediction by returning feature importance or SHAP-based contribution scores, showing which features influenced the model's decision the most.

**Request:**

{

"data": {

"PERFORMANCE_ID": 1,

"agecat": 1,

"...": "..."

},

"prediction_id": "pred_123"

}

**Response:**

{

"prediction": "Good Subject",

"probability": 0.78,

"explanation": {

"top_positive_features": \[

{"feature": "PERFORMANCE_ID", "value": 1, "impact": 0.15},

{"feature": "stable_weigh", "value": 2, "impact": 0.12},

{"feature": "agecat", "value": 1, "impact": 0.08}

\],

"top_negative_features": \[

{"feature": "prior_chemo", "value": 0, "impact": -0.05},

{"feature": "Histologic_grade", "value": 3, "impact": -0.03}

\],

"shap_values": {

"base_value": 0.65,

"features": {

"PERFORMANCE_ID": 0.15,

"stable_weigh": 0.12,

"...": "..."

}

}

}

}

&nbsp;

## **4\. Data Access APIs**

These APIs provide access to the underlying training datasets used to build the model. They allow you to view, upload, and analyze training data records, as well as retrieve dataset statistics such as missing values and class distribution. This supports data governance, transparency, and dataset management for retraining or analysis.

- **GET /training-data**  
    Returns a paginated list of the training dataset records. The endpoint supports query parameters such as page and size for easy browsing of large datasets.

**Request:**

curl -X GET "http://&lt;api-base-url&gt;/training-data?page=1&size=10"

page: 1 (default)

size: 50 (default)

&nbsp;

**Response:**

{

"page": 1,

"size": 10,

"total_records": 546,

"data": \[

{

"MASK_ID": 1,

"PERFORMANCE_ID": 1,

"Hx_oth_cancer": 1,

"offtrt_reason": 1

}

\]

}

&nbsp;

- **GET /training-data/stats**  
    Returns summary statistics about the current training dataset, such as record count, missing value distribution, and basic descriptive metrics.

**Response:**

{

"total_records": 547,

"features_count": 35,

"missing_values": {

"stable_weigh": 12,

"PD_location": 45

},

"target_distribution": {

"Good Subject": 358,

"Bad Subject": 189

}

}

&nbsp;

## **5\. Model Management APIs**

These APIs manage the view of available model versions and deploy a specific model version for production use.

- **GET /models**  
    Lists all available trained model versions stored in the system, along with metadata such as version number, training date, and performance metrics.

**Response:**

{

"models": \[

{

"model_id": "model_1",

"version": "v1.0",

"training_date": "2025-10-01",

"accuracy": 0.92

},

{

"model_id": "model_2",

"version": "v2.0",

"training_date": "2025-11-10",

"accuracy": 0.94

}

\]

}

&nbsp;

- **POST /models/{model_id}/deploy**  
    Deploys a specific trained model version as the active model for serving predictions.

**Request:**

curl -X POST http://&lt;api-base-url&gt;/models/model_2/deploy

&nbsp;

**Response:**

{

"previous_model": "model_v1",

"new_model": "model_v2",

"status": "deployed",

"deployment_time": "2024-01-15T11:00:00Z",

"message": "Model model_v2 successfully deployed as active model"

}

&nbsp;

## **6\. Monitoring & Analytics APIs**

After deployment, these APIs are used to monitor the model's ongoing performance and usage. They provide evaluation metrics like accuracy and F1-score, and also allow you to review past prediction histories for audit and compliance purposes. This helps ensure that the model continues to perform reliably in real-world scenarios.

- **GET /metrics**  
    Provides key model performance metrics such as accuracy, precision, recall, F1-score, and ROC-AUC.

**Response:**

{

"model_name": "A",

"accuracy": 0.912,

"precision": 0.91,

"recall": 0.89,

"f1_score": 0.905,

"roc_auc": 0.937,

"last_evaluated": "2025-10-25T15:00:00Z"

}

&nbsp;

&nbsp;

- **GET /predictions/history**  
    Returns a paginated list of past predictions made by the model, including timestamps, input features, and results. Useful for auditing and analysis.

**Request:**

curl -X GET "http://&lt;api-base-url&gt;/predictions/history?page=1&size=10"

&nbsp;

**Response:**

{

"page": 1,

"size": 10,

"total_predictions": 100,

"predictions": \[

{

"prediction_id": "pred_1",

"timestamp": "2025-11-10T12:00:00Z",

"input_features": {

"PERFORMANCE_ID": 1,

"Hx_oth_cancer": 1,

"...": "..."

},

"prediction": "Good Subject",

"model_name": "a",

"probability": 0.87

}

\]

}

&nbsp;