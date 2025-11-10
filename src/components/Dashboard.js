import React, { useState, useEffect } from 'react';
import { getHealth, getInfo, getTrainingDataStats } from '../api';

function Dashboard() {
  const [health, setHealth] = useState(null);
  const [info, setInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [healthData, infoData, statsData] = await Promise.all([
          getHealth(),
          getInfo(),
          getTrainingDataStats()
        ]);
        setHealth(healthData);
        setInfo(infoData);
        setStats(statsData);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading dashboard...</div>
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

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">
          Overview of service health, model information, and training data analytics
        </p>
      </div>

      {/* Service Health */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Service Health</h2>
        </div>
        <div className="card-content">
          <div className="grid grid-3">
            <div className="metric-box">
              <div className="metric-value">
                <span className={`status-badge status-${health?.status}`}>
                  {health?.status?.toUpperCase()}
                </span>
              </div>
              <div className="metric-label">Service Status</div>
            </div>
            <div className="metric-box">
              <div className="metric-value">
                <span className={`status-badge status-${health?.model_status}`}>
                  {health?.model_status?.toUpperCase()}
                </span>
              </div>
              <div className="metric-label">Model Status</div>
            </div>
            <div className="metric-box">
              <div className="metric-value">{new Date(health?.timestamp).toLocaleTimeString()}</div>
              <div className="metric-label">Last Check</div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Information */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Model Information</h2>
        </div>
        <div className="card-content">
          <div className="grid grid-2" style={{ marginBottom: '20px' }}>
            <div>
              <p><strong>Model Name:</strong> {info?.model_name}</p>
              <p><strong>Version:</strong> {info?.version}</p>
              <p><strong>Algorithm:</strong> {info?.algorithm}</p>
            </div>
            <div>
              <p><strong>Training Date:</strong> {info?.training_date}</p>
              <p><strong>Target:</strong> {info?.target}</p>
              <p><strong>Description:</strong> {info?.description}</p>
            </div>
          </div>

          <h3 style={{ marginTop: '20px', marginBottom: '12px' }}>Performance Metrics</h3>
          <div className="grid grid-4">
            <div className="metric-box">
              <div className="metric-value">{(info?.performance_metrics?.accuracy * 100).toFixed(1)}%</div>
              <div className="metric-label">Accuracy</div>
            </div>
            <div className="metric-box">
              <div className="metric-value">{(info?.performance_metrics?.precision * 100).toFixed(1)}%</div>
              <div className="metric-label">Precision</div>
            </div>
            <div className="metric-box">
              <div className="metric-value">{(info?.performance_metrics?.recall * 100).toFixed(1)}%</div>
              <div className="metric-label">Recall</div>
            </div>
            <div className="metric-box">
              <div className="metric-value">{(info?.performance_metrics?.roc_auc * 100).toFixed(1)}%</div>
              <div className="metric-label">ROC AUC</div>
            </div>
          </div>
        </div>
      </div>

      {/* Training Data Analytics */}
      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Training Data Statistics</h2>
          </div>
          <div className="card-content">
            <div className="metric-box">
              <div className="metric-value">{stats?.total_records}</div>
              <div className="metric-label">Total Records</div>
            </div>
            <div className="metric-box">
              <div className="metric-value">{stats?.features_count}</div>
              <div className="metric-label">Features</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Target Distribution</h2>
          </div>
          <div className="card-content">
            <div className="metric-box">
              <div className="metric-value" style={{ color: '#10b981' }}>
                {stats?.target_distribution?.['Good Subject']}
              </div>
              <div className="metric-label">Good Subjects</div>
            </div>
            <div className="metric-box">
              <div className="metric-value" style={{ color: '#ef4444' }}>
                {stats?.target_distribution?.['Bad Subject']}
              </div>
              <div className="metric-label">Bad Subjects</div>
            </div>
          </div>
        </div>
      </div>

      {/* Missing Values */}
      {stats?.missing_values && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Missing Values Summary</h2>
          </div>
          <div className="card-content">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Missing Count</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stats.missing_values).map(([feature, count]) => (
                    <tr key={feature}>
                      <td>{feature}</td>
                      <td>{count}</td>
                      <td>{((count / stats.total_records) * 100).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
