import React, { useState, useEffect } from 'react';
import { getTrainingData, getTrainingDataStats } from '../api';

function TrainingData() {
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
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
      const [trainingData, statsData] = await Promise.all([
        getTrainingData(currentPage, pageSize),
        getTrainingDataStats()
      ]);
      setData(trainingData);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError('Failed to load training data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="page-container">
        <div className="loading">Loading training data...</div>
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

  const totalPages = Math.ceil((data?.total_records || 0) / pageSize);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Training Data</h1>
        <p className="page-description">
          Browse and analyze the training dataset used for the adherence prediction model
        </p>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-4">
        <div className="card">
          <div className="metric-box">
            <div className="metric-value">{stats?.total_records}</div>
            <div className="metric-label">Total Records</div>
          </div>
        </div>
        <div className="card">
          <div className="metric-box">
            <div className="metric-value">{stats?.features_count}</div>
            <div className="metric-label">Features</div>
          </div>
        </div>
        <div className="card">
          <div className="metric-box">
            <div className="metric-value" style={{ color: '#10b981' }}>
              {stats?.target_distribution?.['Good Subject']}
            </div>
            <div className="metric-label">Good Subjects</div>
          </div>
        </div>
        <div className="card">
          <div className="metric-box">
            <div className="metric-value" style={{ color: '#ef4444' }}>
              {stats?.target_distribution?.['Bad Subject']}
            </div>
            <div className="metric-label">Bad Subjects</div>
          </div>
        </div>
      </div>

      {/* Categorical Distribution */}
      {stats?.categorical_distribution && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Categorical Feature Distribution</h2>
          </div>
          <div className="card-content">
            <div className="grid grid-3">
              {Object.entries(stats.categorical_distribution).slice(0, 3).map(([feature, distribution]) => (
                <div key={feature}>
                  <h4 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    {feature}
                  </h4>
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Value</th>
                          <th>Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(distribution).map(([value, count]) => (
                          <tr key={value}>
                            <td>{value}</td>
                            <td>{count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Numerical Statistics */}
      {stats?.numerical_statistics && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Numerical Feature Statistics</h2>
          </div>
          <div className="card-content">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Mean</th>
                    <th>Median</th>
                    <th>Min</th>
                    <th>Max</th>
                    <th>Std Dev</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stats.numerical_statistics).map(([feature, stat]) => (
                    <tr key={feature}>
                      <td><code>{feature}</code></td>
                      <td>{stat.mean?.toFixed(2)}</td>
                      <td>{stat.median}</td>
                      <td>{stat.min}</td>
                      <td>{stat.max}</td>
                      <td>{stat.std_dev?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Training Data Records */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            Training Records (Page {currentPage} of {totalPages})
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
                  <th>MASK_ID</th>
                  <th>PERFORMANCE_ID</th>
                  <th>Age Cat</th>
                  <th>History Cancer</th>
                  <th>Stable Weight</th>
                  <th>Lymph Nodes</th>
                  <th>T Stage</th>
                  <th>N Stage</th>
                  <th>Target</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((record) => (
                  <tr key={record.MASK_ID}>
                    <td>{record.MASK_ID}</td>
                    <td>{record.PERFORMANCE_ID}</td>
                    <td>{record.agecat}</td>
                    <td>{record.Hx_oth_cancer}</td>
                    <td>{record.stable_weigh}</td>
                    <td>{record.num_lymph_node_examined}</td>
                    <td>{record.T_stage}</td>
                    <td>{record.N_stage}</td>
                    <td>
                      <span className={`status-badge ${
                        record.offtrt_reason === 1 ? 'status-healthy' : 'status-error'
                      }`}>
                        {record.offtrt_reason === 1 ? 'Complete' : 'Incomplete'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '16px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
            Showing records {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, data?.total_records)} of {data?.total_records}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrainingData;
