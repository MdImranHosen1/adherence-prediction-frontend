# Adherence Prediction Frontend

A modern React application for interacting with the Adherence Prediction Model Service. This frontend allows users to monitor API health, validate and preprocess data, make predictions (single/batch), explain predictions, view training data, manage model versions, and analyze model performance.

## 🚀 Features

- **Dashboard**: View service health, model information, and training data analytics
- **Data Management**: Upload and validate input data before making predictions
- **Prediction**: Make single or batch predictions with detailed results
- **Explainability**: View feature importance and SHAP values for predictions
- **Training Data**: Browse, filter, and analyze training dataset
- **Model Management**: List and deploy different model versions
- **Monitoring**: View model performance metrics and prediction history

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (version 14.0 or higher)
- **npm** (comes with Node.js) or **yarn**

## 🛠️ Installation

1. **Navigate to the project directory:**
   ```bash
   cd "e:\work\office\rtl\AdherencePredict UI\adherence-prediction-frontend"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   or if you're using yarn:
   ```bash
   yarn install
   ```

## ⚙️ Configuration

The application uses environment variables for configuration. The `.env` file is already set up with default values:

```
REACT_APP_API_BASE_URL=http://localhost:3000
```

You can modify this file to point to your actual API endpoint when available.

## 🏃 Running the Application

### Development Mode

Start the development server:

```bash
npm start
```

or with yarn:

```bash
yarn start
```

The application will open automatically in your browser at [http://localhost:3000](http://localhost:3000).

### Production Build

To create a production-optimized build:

```bash
npm run build
```

or with yarn:

```bash
yarn build
```

The build files will be generated in the `build/` directory.

## 📁 Project Structure

```
adherence-prediction-frontend/
├── public/
│   ├── data/                     # Mock JSON data files
│   │   ├── health.json
│   │   ├── info.json
│   │   ├── features.json
│   │   ├── training-data.json
│   │   ├── training-data-stats.json
│   │   ├── models.json
│   │   ├── metrics.json
│   │   └── predictions-history.json
│   └── index.html
├── src/
│   ├── components/               # React components
│   │   ├── Dashboard.js         # Dashboard component
│   │   ├── DataManagement.js    # Data validation & preprocessing
│   │   ├── Prediction.js        # Single & batch predictions
│   │   ├── Explainability.js    # Feature importance & SHAP
│   │   ├── TrainingData.js      # Browse training dataset
│   │   ├── ModelManagement.js   # Model version management
│   │   └── Monitoring.js        # Metrics & prediction history
│   ├── api.js                    # API service layer
│   ├── App.js                    # Main app component with routing
│   ├── App.css                   # Application styles
│   ├── index.js                  # Entry point
│   └── index.css                 # Global styles
├── .env                          # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## 🔌 API Integration

### Current Setup (Mock Data)

The application currently uses **mock JSON data** stored in the `public/data/` directory. The API service (`src/api.js`) fetches data from these local JSON files to simulate API responses.

### Switching to Real API

When your backend API is ready, update the `src/api.js` file to make actual HTTP requests:

1. Replace the `fetchJSON` function calls with actual API endpoints
2. Update the base URL in `.env` to point to your API server
3. Implement proper error handling and loading states

Example:
```javascript
// Current (Mock):
export const getHealth = async () => {
  return await fetchJSON('health');
};

// Future (Real API):
export const getHealth = async () => {
  const response = await fetch(`${BASE_URL}/health`);
  return await response.json();
};
```

## 🎨 UI Components

### Navigation

The application features a **sidebar navigation** with the following sections:
- Dashboard
- Data Management
- Prediction
- Explainability
- Training Data
- Model Management
- Monitoring

### Styling

The application uses a custom CSS design system with:
- Responsive grid layouts
- Card-based components
- Color-coded status badges
- Consistent button and form styles
- Mobile-responsive design

## 📊 Usage Guide

### Dashboard
View overall system health and model performance at a glance.

### Data Management
1. Enter or paste JSON data in the input field
2. Click "Load Sample" to see example data format
3. Click "Validate Data" to check if data is properly formatted
4. Click "Preprocess Data" to apply transformations

### Prediction
1. Select prediction type (Single or Batch)
2. Enter JSON data (single object or array)
3. Click "Make Prediction" to get results
4. View prediction, probability, and confidence scores

### Explainability
1. Enter patient data
2. Click "Explain Prediction"
3. View feature importance and SHAP values
4. Understand which features influenced the prediction

### Training Data
- Browse through paginated training records
- View statistics and distributions
- Analyze categorical and numerical features

### Model Management
- View all available model versions
- Compare accuracy and performance
- Deploy different models for active use

### Monitoring
- View real-time performance metrics
- Check confusion matrix
- Browse prediction history

## 🧪 Testing

Run tests (when implemented):

```bash
npm test
```

## 🚀 Deployment

### Deploy to GitHub Pages

This project is configured to deploy to GitHub Pages. Follow these steps:

1. **Ensure your repository is pushed to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to GitHub Pages:**
   ```bash
   npm run deploy
   ```

   This command will:
   - Build the application
   - Create a `gh-pages` branch (if it doesn't exist)
   - Push the build files to the `gh-pages` branch

3. **Configure GitHub Pages:**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under "Source", select the `gh-pages` branch
   - Click **Save**

4. **Access your deployed app:**
   - Your app will be available at: `https://mdimranhosen1.github.io/adherence-prediction-frontend`
   - It may take a few minutes for the first deployment

### Deploy to Other Production Environments

If you want to deploy to other hosting services:

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the `build/` directory to your hosting service (e.g., Netlify, Vercel, AWS S3)

### Environment Variables for Production

Make sure to set the correct API URL in your production environment:
```
REACT_APP_API_BASE_URL=https://your-production-api.com
```

## 🔧 Troubleshooting

### Port Already in Use

If port 3000 is already in use, you can specify a different port:
```bash
PORT=3001 npm start
```

### API Connection Issues

If you're having trouble connecting to the API:
1. Check the `.env` file for correct API URL
2. Ensure CORS is properly configured on your backend
3. Check browser console for error messages

### Build Errors

If you encounter build errors:
1. Delete `node_modules/` and `package-lock.json`
2. Run `npm install` again
3. Clear npm cache: `npm cache clean --force`

## 📝 Future Enhancements

- [ ] Add user authentication
- [ ] Implement real-time prediction updates
- [ ] Add data visualization charts
- [ ] Export prediction results to CSV/Excel
- [ ] Add dark mode theme
- [ ] Implement advanced filtering and search

## 👥 Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## 📄 License

This project is proprietary software for internal use.

## 📧 Support

For questions or issues, please contact the development team.

---

**Version:** 1.2.0  
**Last Updated:** November 10, 2025
