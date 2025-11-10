import React, { useState, useEffect } from 'react';
import { getModels, deployModel } from '../api';

function ModelManagement() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deployResult, setDeployResult] = useState(null);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const data = await getModels();
      setModels(data.models || []);
      setError(null);
    } catch (err) {
      setError('Failed to load models');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async (modelId) => {
    try {
      setLoading(true);
      setDeployResult(null);
      const result = await deployModel(modelId);
      setDeployResult(result);
      // Refresh models list
      await fetchModels();
    } catch (err) {
      setError('Failed to deploy model');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && models.length === 0) {
    return (
      <div className="page-container">
        <div className="loading">Loading models...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Model Management</h1>
        <p className="page-description">
          View available model versions and deploy models for prediction
        </p>
      </div>

      {error && <div className="error">{error}</div>}
      
      {deployResult && (
        <div className="success">
          ✓ {deployResult.message}
          <br />
          <small>
            Previous: {deployResult.previous_model} → New: {deployResult.new_model}
            <br />
            Deployed at: {new Date(deployResult.deployment_time).toLocaleString()}
          </small>
        </div>
      )}

      {/* Models List */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Available Models</h2>
          <button className="btn btn-secondary" onClick={fetchModels} disabled={loading}>
            Refresh
          </button>
        </div>
        <div className="card-content">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Model ID</th>
                  <th>Version</th>
                  <th>Algorithm</th>
                  <th>Training Date</th>
                  <th>Accuracy</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {models.map((model) => (
                  <tr key={model.model_id}>
                    <td><code>{model.model_id}</code></td>
                    <td>{model.version}</td>
                    <td>{model.algorithm}</td>
                    <td>{model.training_date}</td>
                    <td>{(model.accuracy * 100).toFixed(1)}%</td>
                    <td>
                      <span className={`status-badge status-${
                        model.status === 'deployed' ? 'active' :
                        model.status === 'testing' ? 'warning' : 'healthy'
                      }`}>
                        {model.status}
                      </span>
                    </td>
                    <td>
                      {model.status !== 'deployed' && (
                        <button
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={() => handleDeploy(model.model_id)}
                          disabled={loading}
                        >
                          Deploy
                        </button>
                      )}
                      {model.status === 'deployed' && (
                        <span style={{ color: '#10b981', fontSize: '14px' }}>✓ Active</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Model Details Cards */}
      <div className="grid grid-3">
        {models.map((model) => (
          <div key={model.model_id} className="card">
            <div className="card-header">
              <h3 className="card-title">{model.version}</h3>
              <span className={`status-badge status-${
                model.status === 'deployed' ? 'active' :
                model.status === 'testing' ? 'warning' : 'healthy'
              }`}>
                {model.status}
              </span>
            </div>
            <div className="card-content">
              <p><strong>Model ID:</strong> {model.model_id}</p>
              <p><strong>Algorithm:</strong> {model.algorithm}</p>
              <p><strong>Training Date:</strong> {model.training_date}</p>
              <div className="metric-box" style={{ marginTop: '12px' }}>
                <div className="metric-value">{(model.accuracy * 100).toFixed(1)}%</div>
                <div className="metric-label">Accuracy</div>
              </div>
              {model.status !== 'deployed' && (
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '12px' }}
                  onClick={() => handleDeploy(model.model_id)}
                  disabled={loading}
                >
                  Deploy This Model
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Model Information */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">About Model Deployment</h2>
        </div>
        <div className="card-content">
          <p style={{ lineHeight: '1.6', color: '#475569' }}>
            Deploying a model will make it the active model used for all prediction requests. 
            The currently deployed model is marked with an "Active" status. Only one model can be 
            deployed at a time. Before deploying a new model, ensure it has been properly tested 
            and validated.
          </p>
          <div style={{ marginTop: '16px', padding: '12px', background: '#fef3c7', borderRadius: '6px' }}>
            <strong>⚠️ Note:</strong> Deploying a new model will immediately affect all prediction 
            endpoints. Make sure to review the model's performance metrics before deployment.
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModelManagement;
