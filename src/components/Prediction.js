import React, { useState } from 'react';
import { predictSingle, predictBatch } from '../api';

function Prediction() {
  const [predictionType, setPredictionType] = useState('single');
  const [inputData, setInputData] = useState('');
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePredict = async () => {
    try {
      setLoading(true);
      setError(null);
      const parsedData = JSON.parse(inputData);

      let result;
      if (predictionType === 'single') {
        result = await predictSingle(parsedData);
      } else {
        // For batch predictions, expect an array
        const dataArray = Array.isArray(parsedData) ? parsedData : [parsedData];
        result = await predictBatch(dataArray);
      }

      setPredictionResult(result);
    } catch (err) {
      setError('Invalid JSON format or prediction failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sampleSingleInput = {
    PERFORMANCE_ID: 1,
    Hx_oth_cancer: 1,
    stable_weigh: 2,
    examed_by_radiation_oncologist: 1,
    bilateral_renal_function: 1,
    No_cardiact_condition: 1,
    prior_chemo: 0,
    prior_radiation: 0,
    Gastro_esophageal_junction: 0,
    cardia: 0,
    fundus: 0,
    body_corpus: 1,
    antrum: 0,
    pylorus_pyloric_channel: 0,
    greater_curvature: 0,
    lesser_curvature: 0,
    stomach_NOS: 0,
    Histologic_grade: 3,
    num_lymph_node_examined: 7,
    num_pos_lymph_node: 0,
    T_stage: 2,
    N_stage: 0,
    M_stage: 0,
    T2N0M0_spec: 2,
    PD_location: null,
    ETHNIC_ID: 1,
    SEX_ID: 1,
    RACE_ID: 1,
    TREAT_ASSIGNED: 2,
    STRATUM_GRP_ID: 1,
    agecat: 1
  };

  const sampleBatchInput = [
    { MASK_ID: 1, PERFORMANCE_ID: 1, agecat: 1, Hx_oth_cancer: 1 },
    { MASK_ID: 2, PERFORMANCE_ID: 0, agecat: 2, Hx_oth_cancer: 0 }
  ];

  const loadSample = () => {
    if (predictionType === 'single') {
      setInputData(JSON.stringify(sampleSingleInput, null, 2));
    } else {
      setInputData(JSON.stringify(sampleBatchInput, null, 2));
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Prediction</h1>
        <p className="page-description">
          Make single or batch predictions using the adherence prediction model
        </p>
      </div>

      {error && <div className="error">{error}</div>}

      {/* Prediction Type Selection */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Prediction Type</h2>
        </div>
        <div className="card-content">
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className={`btn ${predictionType === 'single' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                setPredictionType('single');
                setPredictionResult(null);
                setInputData('');
              }}
            >
              Single Prediction
            </button>
            <button
              className={`btn ${predictionType === 'batch' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                setPredictionType('batch');
                setPredictionResult(null);
                setInputData('');
              }}
            >
              Batch Prediction
            </button>
          </div>
        </div>
      </div>

      {/* Input Data */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Input Data ({predictionType})</h2>
          <button className="btn btn-secondary" onClick={loadSample}>
            Load Sample
          </button>
        </div>
        <div className="card-content">
          <div className="form-group">
            <label className="form-label">
              Enter JSON data {predictionType === 'batch' ? '(array of objects)' : '(single object)'}:
            </label>
            <textarea
              className="form-textarea"
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder={JSON.stringify(
                predictionType === 'single' ? sampleSingleInput : sampleBatchInput,
                null,
                2
              )}
              rows={15}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handlePredict}
            disabled={loading || !inputData}
          >
            {loading ? 'Predicting...' : 'Make Prediction'}
          </button>
        </div>
      </div>

      {/* Prediction Results */}
      {predictionResult && predictionType === 'single' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Prediction Result</h2>
          </div>
          <div className="card-content">
            <div className="grid grid-3">
              <div className="metric-box">
                <div className="metric-value">
                  <span className={`status-badge ${
                    predictionResult.prediction === 'Good Subject' ? 'status-healthy' : 'status-error'
                  }`}>
                    {predictionResult.prediction}
                  </span>
                </div>
                <div className="metric-label">Prediction</div>
              </div>
              <div className="metric-box">
                <div className="metric-value">{(predictionResult.probability * 100).toFixed(1)}%</div>
                <div className="metric-label">Probability</div>
              </div>
              <div className="metric-box">
                <div className="metric-value">
                  <span className={`status-badge status-${predictionResult.confidence}`}>
                    {predictionResult.confidence}
                  </span>
                </div>
                <div className="metric-label">Confidence</div>
              </div>
            </div>
            <div style={{ marginTop: '20px' }}>
              <p><strong>Class Label:</strong> {predictionResult.class_label}</p>
              <p><strong>Timestamp:</strong> {new Date(predictionResult.timestamp).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Batch Prediction Results */}
      {predictionResult && predictionType === 'batch' && (
        <>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Batch Prediction Summary</h2>
            </div>
            <div className="card-content">
              <div className="grid grid-3">
                <div className="metric-box">
                  <div className="metric-value">{predictionResult.summary?.total_records}</div>
                  <div className="metric-label">Total Records</div>
                </div>
                <div className="metric-box">
                  <div className="metric-value" style={{ color: '#10b981' }}>
                    {predictionResult.summary?.good_subjects}
                  </div>
                  <div className="metric-label">Good Subjects</div>
                </div>
                <div className="metric-box">
                  <div className="metric-value" style={{ color: '#ef4444' }}>
                    {predictionResult.summary?.bad_subjects}
                  </div>
                  <div className="metric-label">Bad Subjects</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Individual Predictions</h2>
            </div>
            <div className="card-content">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Prediction</th>
                      <th>Probability</th>
                      <th>Confidence</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictionResult.predictions?.map((pred, index) => (
                      <tr key={index}>
                        <td>{pred.MASK_ID}</td>
                        <td>
                          <span className={`status-badge ${
                            pred.prediction === 'Good Subject' ? 'status-healthy' : 'status-error'
                          }`}>
                            {pred.prediction}
                          </span>
                        </td>
                        <td>{(pred.probability * 100).toFixed(1)}%</td>
                        <td>
                          <span className={`status-badge status-${pred.confidence}`}>
                            {pred.confidence}
                          </span>
                        </td>
                        <td>{new Date(pred.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Prediction;
