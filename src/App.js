import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';

// Import components
import Dashboard from './components/Dashboard';
import DataManagement from './components/DataManagement';
import Prediction from './components/Prediction';
import Explainability from './components/Explainability';
import TrainingData from './components/TrainingData';
import ModelManagement from './components/ModelManagement';
import Monitoring from './components/Monitoring';

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/data-management" element={<DataManagement />} />
            <Route path="/prediction" element={<Prediction />} />
            <Route path="/explainability" element={<Explainability />} />
            <Route path="/training-data" element={<TrainingData />} />
            <Route path="/model-management" element={<ModelManagement />} />
            <Route path="/monitoring" element={<Monitoring />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/data-management', label: 'Data Management', icon: '📁' },
    { path: '/prediction', label: 'Prediction', icon: '🔮' },
    { path: '/explainability', label: 'Explainability', icon: '💡' },
    { path: '/training-data', label: 'Training Data', icon: '📈' },
    { path: '/model-management', label: 'Model Management', icon: '⚙️' },
    { path: '/monitoring', label: 'Monitoring', icon: '📉' }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>🏥 Adherence Predict</h2>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <p>Version 1.2.0</p>
      </div>
    </div>
  );
}

export default App;
