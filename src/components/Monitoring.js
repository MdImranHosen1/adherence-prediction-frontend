import React, { useState, useEffect } from 'react';
import { getMetrics, getPredictionsHistory } from '../api';

function Monitoring() {
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [metricsData, historyData] = await Promise.all([
        getMetrics(),
        getPredictionsHistory(currentPage, pageSize)
      ]);
      setMetrics(metricsData);
      setHistory(historyData);
      setError(null);
    } catch (err) {
      setError('Failed to load monitoring data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !metrics) {
    return (
      <div className="page-container">
        <div className="loading">Loading monitoring data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  const totalPages = Math.ceil((history?.total_predictions || 0) / pageSize);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Monitoring & Analytics</h1>
        <p className="page-description">
          View model performance metrics and prediction history
        </p>
      </div>

      {/* Model Performance Metrics */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Model Performance Metrics</h2>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Last evaluated: {new Date(metrics?.last_evaluated).toLocaleString()}
          </p>
        </div>
        <div className="card-content">
          <div className="grid grid-4">
            <div className="metric-box">
              <div className="metric-value">{(metrics?.accuracy * 100).toFixed(1)}%</div>
              <div className="metric-label">Accuracy</div>
            </div>
            <div className="metric-box">
              <div className="metric-value">{(metrics?.precision * 100).toFixed(1)}%</div>
              <div className="metric-label">Precision</div>
            </div>
            <div className="metric-box">
              <div className="metric-value">{(metrics?.recall * 100).toFixed(1)}%</div>
              <div className="metric-label">Recall</div>
            </div>
            <div className="metric-box">
              <div className="metric-value">{(metrics?.f1_score * 100).toFixed(1)}%</div>
              <div className="metric-label">F1 Score</div>
            </div>
          </div>
          <div style={{ marginTop: '20px' }}>
            <div className="metric-box">
              <div className="metric-value">{(metrics?.roc_auc * 100).toFixed(1)}%</div>
              <div className="metric-label">ROC AUC</div>
            </div>
          </div>
        </div>
      </div>

      {/* Confusion Matrix */}
      {metrics?.confusion_matrix && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Confusion Matrix</h2>
          </div>
          <div className="card-content">
            <div className="grid grid-2">
              <div className="metric-box" style={{ background: '#d1fae5' }}>
                <div className="metric-value" style={{ color: '#065f46' }}>
                  {metrics.confusion_matrix.true_positive}
                </div>
                <div className="metric-label">True Positive</div>
              </div>
              <div className="metric-box" style={{ background: '#fee2e2' }}>
                <div className="metric-value" style={{ color: '#991b1b' }}>
                  {metrics.confusion_matrix.false_positive}
                </div>
                <div className="metric-label">False Positive</div>
              </div>
              <div className="metric-box" style={{ background: '#fee2e2' }}>
                <div className="metric-value" style={{ color: '#991b1b' }}>
                  {metrics.confusion_matrix.false_negative}
                </div>
                <div className="metric-label">False Negative</div>
              </div>
              <div className="metric-box" style={{ background: '#d1fae5' }}>
                <div className="metric-value" style={{ color: '#065f46' }}>
                  {metrics.confusion_matrix.true_negative}
                </div>
                <div className="metric-label">True Negative</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Per-Class Metrics */}
      {metrics?.per_class_metrics && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Per-Class Metrics</h2>
          </div>
          <div className="card-content">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Class</th>
                    <th>Precision</th>
                    <th>Recall</th>
                    <th>F1 Score</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(metrics.per_class_metrics).map(([className, classMetrics]) => (
                    <tr key={className}>
                      <td>
                        <span className={`status-badge ${
                          className === 'Good Subject' ? 'status-healthy' : 'status-error'
                        }`}>
                          {className}
                        </span>
                      </td>
                      <td>{(classMetrics.precision * 100).toFixed(1)}%</td>
                      <td>{(classMetrics.recall * 100).toFixed(1)}%</td>
                      <td>{(classMetrics.f1_score * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Predictions History */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            Prediction History (Page {currentPage} of {totalPages})
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
        <div className="card-content">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Prediction ID</th>
                  <th>Timestamp</th>
                  <th>Prediction</th>
                  <th>Probability</th>
                  <th>Model</th>
                </tr>
              </thead>
              <tbody>
                {history?.predictions?.map((prediction) => (
                  <tr key={prediction.prediction_id}>
                    <td><code>{prediction.prediction_id}</code></td>
                    <td>{new Date(prediction.timestamp).toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${
                        prediction.prediction === 'Good Subject' ? 'status-healthy' : 'status-error'
                      }`}>
                        {prediction.prediction}
                      </span>
                    </td>
                    <td>{(prediction.probability * 100).toFixed(1)}%</td>
                    <td>{prediction.model_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '16px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
            Showing predictions {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, history?.total_predictions)} of {history?.total_predictions}
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Prediction Summary</h2>
        </div>
        <div className="card-content">
          <div className="grid grid-3">
            <div className="metric-box">
              <div className="metric-value">{history?.total_predictions}</div>
              <div className="metric-label">Total Predictions</div>
            </div>
            <div className="metric-box">
              <div className="metric-value" style={{ color: '#10b981' }}>
                {history?.predictions?.filter(p => p.prediction === 'Good Subject').length || 0}
              </div>
              <div className="metric-label">Good Subjects (This Page)</div>
            </div>
            <div className="metric-box">
              <div className="metric-value" style={{ color: '#ef4444' }}>
                {history?.predictions?.filter(p => p.prediction === 'Bad Subject').length || 0}
              </div>
              <div className="metric-label">Bad Subjects (This Page)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Monitoring;
