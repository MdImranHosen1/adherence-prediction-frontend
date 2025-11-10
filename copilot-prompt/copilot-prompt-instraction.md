
## 📦 Adherence Prediction Model Service Frontend – Copilot Prompt

### 🚀 Project Goal

Create a modern React frontend application to interact with the Adherence Prediction Model Service REST API. The frontend should allow users to monitor API health, validate and preprocess data, make predictions (single/batch), explain predictions, view training data, manage model versions, and analyze model performance.

---

### ✅ Core Requirements

1. **API Integration**  
   - Connect with all specified API endpoints (`/health`, `/info`, `/validate-data`, `/features`, `/preprocess`, `/predict`, `/predict-batch`, `/explain`, `/training-data`, `/training-data/stats`, `/models`, `/models/{model_id}/deploy`, `/metrics`, `/predictions/history`)
2. **UI Features**  
Those option will be in the left side bar.
   - Dashboard: Show service health and model info  and some analytick for the traning-data
   - Data Management: Upload and validate input  
   - Prediction: Enter single data or upload batch CSV or json, display results & confidence  
   - Explainability: View feature importance for predictions  
   - Training Data: Browse, filter, and view stats  
   - Model Management: List/deploy model versions  
   - Monitoring: View metrics and prediction history
3. **Structure**  
   - Use React functional components and hooks  
   - Organize components by feature (e.g., Dashboard, Prediction, TrainingData, ModelManagement)  
   - Store API base URL and API logic in a reusable service (`api.js`)
4. **Style**  
   - Use basic CSS or UI framework (like Material-UI or Ant Design, you pick)  
   - Focus on layout/readability, not final design
5. **Scaffolding**  
   - Use `create-react-app` (default), but allow for Vite option if chosen  
   - Include README explaining setup

---

### 📝 Example API Scaffolding
All api now will be temporary json file. create those json file also. We will build a system for api call but get data from json. 
**API Service (`src/api.js`)**  
Create utility functions to call each endpoint (e.g., `getHealth()`, `getInfo()`, `validateData(payload)`, etc.).

**Component Structure**  
- `/src/components/Dashboard.js`
- `/src/components/DataManagement.js`
- `/src/components/Prediction.js`
- `/src/components/Explainability.js`
- `/src/components/TrainingData.js`
- `/src/components/ModelManagement.js`
- `/src/components/Monitoring.js`

---

### 🔖 UI Flow

1. **Dashboard**  
   - Check `/health` & `/info` at startup and 
2. **Data Management**  
   - Upload/enter input, run `/validate-data` and `/preprocess`
3. **Prediction**  
   - Allow both single and batch; display output from `/predict` and `/predict-batch`
4. **Explainability**  
   - Select a prediction to view `/explain` results
5. **Training Data**  
   - Paginate through `/training-data`, view stats
6. **Model Management**  
   - List from `/models`, deploy as needed
7. **Monitoring/Analytics**  
   - Show `/metrics`, browse `/predictions/history`

---

### 🛠️ Additional Setup

- Provide `.env` for API base URL
- Use Axios or Fetch for REST calls (your choice)
- README with install/run instructions

---

### ⚡ Copilot Action

> Scaffold a React app (using create-react-app or Vite), with a clear folder structure, example API service for the given endpoints, and stub out one basic UI component per feature area. Fill with comments on where to expand logic.

---

## Example Folder Structure

```
adherence-prediction-frontend/
├─ public/
├─ src/
│  ├─ api.js
│  ├─ components/
│  │  ├─ Dashboard.js
│  │  ├─ DataManagement.js
│  │  ├─ Prediction.js
│  │  ├─ Explainability.js
│  │  ├─ TrainingData.js
│  │  ├─ ModelManagement.js
│  │  ├─ Monitoring.js
│  ├─ App.js
│  ├─ index.js
├─ .env
├─ README.md
```

---

## 📋 Copilot Instructions

**Copilot, scaffold a React app called `adherence-prediction-frontend` with the above folder and file structure.**  
- Each component should contain a placeholder UI and references to the API logic.  
- The API module should stub functions for each endpoint described.
- Add comments for where the user can expand each file after generation.

---

