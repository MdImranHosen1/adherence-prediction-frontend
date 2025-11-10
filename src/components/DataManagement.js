import React, { useState, useEffect } from 'react';
import { getFeatures, validateData, preprocessData } from '../api';

function DataManagement() {
  const [features, setFeatures] = useState(null);
  const [inputData, setInputData] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [preprocessResult, setPreprocessResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const data = await getFeatures();
        setFeatures(data);
      } catch (err) {
        setError('Failed to load features');
        console.error(err);
      }
    };

    fetchFeatures();
  }, []);

  const handleValidate = async () => {
    try {
      setLoading(true);
      setError(null);
      const parsedData = JSON.parse(inputData);
      const result = await validateData(parsedData);
      setValidationResult(result);
    } catch (err) {
      setError('Invalid JSON format or validation failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreprocess = async () => {
    try {
      setLoading(true);
      setError(null);
      const parsedData = JSON.parse(inputData);
      const result = await preprocessData(parsedData);
      setPreprocessResult(result);
    } catch (err) {
      setError('Invalid JSON format or preprocessing failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sampleInput = {
    PERFORMANCE_ID: 1,
    Hx_oth_cancer: 1,
    stable_weigh: 2,
    agecat: 1,
    num_lymph_node_examined: 7,
    num_pos_lymph_node: 0
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Data Management</h1>
        <p className="page-description">
          Validate and preprocess input data before making predictions
        </p>
      </div>

      {error && <div className="error">{error}</div>}

      {/* Features Information */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Model Features</h2>
        </div>
        <div className="card-content">
          <p style={{ marginBottom: '16px' }}>
            <strong>Total Features:</strong> {features?.total_features} 
            ({features?.categorical_features} categorical, {features?.numerical_features} numerical)
          </p>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Feature Name</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Required</th>
                  <th>Constraints</th>
                </tr>
              </thead>
              <tbody>
                {features?.features?.slice(0, 10).map((feature) => (
                  <tr key={feature.name}>
                    <td><code>{feature.name}</code></td>
                    <td>{feature.type}</td>
                    <td>{feature.description}</td>
                    <td>{feature.required ? '✓' : '✗'}</td>
                    <td>
                      {feature.allowed_values 
                        ? `Values: ${feature.allowed_values.join(', ')}`
                        : feature.min_value !== undefined 
                        ? `Range: ${feature.min_value}-${feature.max_value}`
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {features?.features?.length > 10 && (
            <p style={{ marginTop: '12px', color: '#64748b', fontSize: '14px' }}>
              Showing first 10 of {features.features.length} features
            </p>
          )}
        </div>
      </div>

      {/* Data Input */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Input Data</h2>
          <button 
            className="btn btn-secondary"
            onClick={() => setInputData(JSON.stringify(sampleInput, null, 2))}
          >
            Load Sample
          </button>
        </div>
        <div className="card-content">
          <div className="form-group">
            <label className="form-label">Enter JSON data:</label>
            <textarea
              className="form-textarea"
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder={JSON.stringify(sampleInput, null, 2)}
              rows={12}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn btn-primary"
              onClick={handleValidate}
              disabled={loading || !inputData}
            >
              Validate Data
            </button>
            <button 
              className="btn btn-success"
              onClick={handlePreprocess}
              disabled={loading || !inputData}
            >
              Preprocess Data
            </button>
          </div>
        </div>
      </div>

      {/* Validation Result */}
      {validationResult && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Validation Result</h2>
          </div>
          <div className="card-content">
            {validationResult.is_valid ? (
              <div className="success">
                ✓ Data is valid and ready for prediction
              </div>
            ) : (
              <div className="error">
                ✗ Data validation failed
              </div>
            )}
            {validationResult.missing_columns?.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <strong>Missing Columns:</strong>
                <ul>
                  {validationResult.missing_columns.map((col) => (
                    <li key={col}>{col}</li>
                  ))}
                </ul>
              </div>
            )}
            {validationResult.message && (
              <p style={{ marginTop: '12px' }}>{validationResult.message}</p>
            )}
          </div>
        </div>
      )}

      {/* Preprocessing Result */}
      {preprocessResult && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Preprocessing Result</h2>
          </div>
          <div className="card-content">
            <div className="success">
              ✓ Data preprocessed successfully
            </div>
            <pre style={{ 
              marginTop: '12px', 
              background: '#f8fafc', 
              padding: '12px', 
              borderRadius: '6px',
              overflow: 'auto'
            }}>
              {JSON.stringify(preprocessResult.preprocessed_data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataManagement;
