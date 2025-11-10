import React, { useState } from 'react';
import { explainPrediction } from '../api';

function Explainability() {
  const [inputData, setInputData] = useState('');
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleExplain = async () => {
    try {
      setLoading(true);
      setError(null);
      const parsedData = JSON.parse(inputData);
      const result = await explainPrediction(parsedData);
      setExplanation(result);
    } catch (err) {
      setError('Invalid JSON format or explanation failed');
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
    prior_chemo: 0,
    Histologic_grade: 3
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Explainability</h1>
        <p className="page-description">
          Understand which features influence the model's predictions
        </p>
      </div>

      {error && <div className="error">{error}</div>}

      {/* Input Data */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Input Data for Explanation</h2>
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
              rows={10}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleExplain}
            disabled={loading || !inputData}
          >
            {loading ? 'Generating Explanation...' : 'Explain Prediction'}
          </button>
        </div>
      </div>

      {/* Explanation Results */}
      {explanation && (
        <>
          {/* Prediction Overview */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Prediction Overview</h2>
            </div>
            <div className="card-content">
              <div className="grid grid-2">
                <div className="metric-box">
                  <div className="metric-value">
                    <span className={`status-badge ${
                      explanation.prediction === 'Good Subject' ? 'status-healthy' : 'status-error'
                    }`}>
                      {explanation.prediction}
                    </span>
                  </div>
                  <div className="metric-label">Prediction</div>
                </div>
                <div className="metric-box">
                  <div className="metric-value">{(explanation.probability * 100).toFixed(1)}%</div>
                  <div className="metric-label">Probability</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Importance */}
          <div className="grid grid-2">
            {/* Positive Features */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Top Positive Features</h2>
              </div>
              <div className="card-content">
                <p style={{ marginBottom: '12px', fontSize: '14px', color: '#64748b' }}>
                  Features that increase the likelihood of completion
                </p>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Feature</th>
                        <th>Value</th>
                        <th>Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {explanation.explanation?.top_positive_features?.map((feature, index) => (
                        <tr key={index}>
                          <td><code>{feature.feature}</code></td>
                          <td>{feature.value}</td>
                          <td>
                            <span style={{ color: '#10b981', fontWeight: '600' }}>
                              +{feature.impact.toFixed(3)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Negative Features */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Top Negative Features</h2>
              </div>
              <div className="card-content">
                <p style={{ marginBottom: '12px', fontSize: '14px', color: '#64748b' }}>
                  Features that decrease the likelihood of completion
                </p>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Feature</th>
                        <th>Value</th>
                        <th>Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {explanation.explanation?.top_negative_features?.map((feature, index) => (
                        <tr key={index}>
                          <td><code>{feature.feature}</code></td>
                          <td>{feature.value}</td>
                          <td>
                            <span style={{ color: '#ef4444', fontWeight: '600' }}>
                              {feature.impact.toFixed(3)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* SHAP Values */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">SHAP Values</h2>
            </div>
            <div className="card-content">
              <p style={{ marginBottom: '16px' }}>
                <strong>Base Value:</strong> {explanation.explanation?.shap_values?.base_value?.toFixed(3)}
              </p>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Feature</th>
                      <th>SHAP Value</th>
                      <th>Contribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(explanation.explanation?.shap_values?.features || {}).map(([feature, value]) => (
                      <tr key={feature}>
                        <td><code>{feature}</code></td>
                        <td>{value.toFixed(3)}</td>
                        <td>
                          <div style={{ 
                            width: '100%', 
                            background: '#f1f5f9',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${Math.abs(value) * 200}%`,
                              maxWidth: '100%',
                              height: '20px',
                              background: value > 0 ? '#10b981' : '#ef4444',
                              transition: 'width 0.3s'
                            }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Explanation Info */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">About SHAP Values</h2>
            </div>
            <div className="card-content">
              <p style={{ lineHeight: '1.6', color: '#475569' }}>
                SHAP (SHapley Additive exPlanations) values show how much each feature contributes to the 
                prediction. Positive values (in green) push the prediction toward "Good Subject" (treatment completion), 
                while negative values (in red) push toward "Bad Subject" (treatment non-completion). 
                The base value represents the average model output, and each feature's SHAP value shows 
                its deviation from this baseline.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Explainability;
