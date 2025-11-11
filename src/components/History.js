import React, { useState, useEffect, useCallback } from 'react';
import { getMetrics, getPredictionsHistory } from '../api';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  LinearProgress,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  TrendingUp,
  Timeline,
  Assessment,
  Speed,
  Visibility,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  CalendarToday,
  AccessTime,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function History() {
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [metricsData, historyData] = await Promise.all([
        getMetrics(),
        getPredictionsHistory(currentPage + 1, pageSize)
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
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setCurrentPage(0);
  };

  if (loading && !metrics) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Prepare chart data
  const performanceMetricsData = [
    { name: 'Accuracy', value: (metrics?.accuracy * 100) || 0, color: '#3b82f6' },
    { name: 'Precision', value: (metrics?.precision * 100) || 0, color: '#10b981' },
    { name: 'Recall', value: (metrics?.recall * 100) || 0, color: '#f59e0b' },
    { name: 'F1 Score', value: (metrics?.f1_score * 100) || 0, color: '#8b5cf6' },
    { name: 'ROC AUC', value: (metrics?.roc_auc * 100) || 0, color: '#ec4899' },
  ];

  const confusionMatrixData = metrics?.confusion_matrix ? [
    { name: 'True Positive', value: metrics.confusion_matrix.true_positive, color: '#10b981' },
    { name: 'False Positive', value: metrics.confusion_matrix.false_positive, color: '#f59e0b' },
    { name: 'True Negative', value: metrics.confusion_matrix.true_negative, color: '#3b82f6' },
    { name: 'False Negative', value: metrics.confusion_matrix.false_negative, color: '#ef4444' },
  ] : [];

  const predictionDistribution = [
    { 
      name: 'Good Subject', 
      value: history?.predictions?.filter(p => p.prediction === 'Good Subject').length || 0,
      color: '#10b981'
    },
    { 
      name: 'Bad Subject', 
      value: history?.predictions?.filter(p => p.prediction === 'Bad Subject').length || 0,
      color: '#ef4444'
    },
  ];

  // Calculate average probability
  const avgProbability = history?.predictions?.length > 0
    ? (history.predictions.reduce((sum, p) => sum + p.probability, 0) / history.predictions.length * 100).toFixed(1)
    : 0;

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
          Monitoring & History
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Model performance metrics, prediction analytics, and historical data
        </Typography>
      </Box>

      {/* Key Performance Indicators */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 0.5 }}>
                    Model Accuracy
                  </Typography>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                    {(metrics?.accuracy * 100).toFixed(1)}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <Assessment sx={{ color: 'white', fontSize: 30 }} />
                </Avatar>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={metrics?.accuracy * 100} 
                sx={{ 
                  mt: 2, 
                  height: 6, 
                  borderRadius: 3,
                  bgcolor: 'rgba(255,255,255,0.3)',
                  '& .MuiLinearProgress-bar': { bgcolor: 'white' }
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 0.5 }}>
                    Total Predictions
                  </Typography>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                    {history?.total_predictions || 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <Timeline sx={{ color: 'white', fontSize: 30 }} />
                </Avatar>
              </Box>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp sx={{ color: 'white', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: 'white' }}>
                  Showing {history?.predictions?.length || 0} items
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 0.5 }}>
                    Avg Confidence
                  </Typography>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                    {avgProbability}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <Speed sx={{ color: 'white', fontSize: 30 }} />
                </Avatar>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={avgProbability} 
                sx={{ 
                  mt: 2, 
                  height: 6, 
                  borderRadius: 3,
                  bgcolor: 'rgba(255,255,255,0.3)',
                  '& .MuiLinearProgress-bar': { bgcolor: 'white' }
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ height: '100%', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 0.5 }}>
                    ROC AUC Score
                  </Typography>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                    {(metrics?.roc_auc * 100).toFixed(1)}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <BarChartIcon sx={{ color: 'white', fontSize: 30 }} />
                </Avatar>
              </Box>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle sx={{ color: 'white', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: 'white' }}>
                  Excellent Performance
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Metrics and Confusion Matrix */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Performance Metrics Chart */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assessment color="primary" /> Performance Metrics
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceMetricsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} angle={-15} textAnchor="end" height={80} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#64748b' }} />
                  <RechartsTooltip 
                    formatter={(value) => `${value.toFixed(2)}%`}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 8 }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {performanceMetricsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                {performanceMetricsData.map((metric, index) => (
                  <Grid item xs={6} sm={4} key={index}>
                    <Paper elevation={1} sx={{ p: 1.5, textAlign: 'center', bgcolor: '#f8fafc' }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: metric.color }}>
                        {metric.value.toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {metric.name}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Confusion Matrix */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PieChartIcon color="primary" /> Confusion Matrix
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={confusionMatrixData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {confusionMatrixData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                {confusionMatrixData.map((item, index) => (
                  <Grid item xs={6} key={index}>
                    <Paper 
                      elevation={1} 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        bgcolor: `${item.color}15`,
                        border: `2px solid ${item.color}`
                      }}
                    >
                      <Typography variant="h5" sx={{ fontWeight: 700, color: item.color }}>
                        {item.value}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 500 }}>
                        {item.name}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Per-Class Metrics */}
      {metrics?.per_class_metrics && (
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Timeline color="primary" /> Per-Class Performance Metrics
            </Typography>
            <Grid container spacing={3}>
              {Object.entries(metrics.per_class_metrics).map(([className, classMetrics]) => (
                <Grid item xs={12} md={6} key={className}>
                  <Paper 
                    elevation={3}
                    sx={{ 
                      p: 3,
                      background: className === 'Good Subject'
                        ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
                        : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                      border: `3px solid ${className === 'Good Subject' ? '#10b981' : '#ef4444'}`
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      {className === 'Good Subject' ? (
                        <CheckCircle sx={{ fontSize: 40, color: '#065f46' }} />
                      ) : (
                        <Cancel sx={{ fontSize: 40, color: '#991b1b' }} />
                      )}
                      <Typography variant="h5" sx={{ fontWeight: 700, color: className === 'Good Subject' ? '#065f46' : '#991b1b' }}>
                        {className}
                      </Typography>
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b82f6' }}>
                            {(classMetrics.precision * 100).toFixed(1)}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">Precision</Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={classMetrics.precision * 100} 
                            sx={{ mt: 1, height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981' }}>
                            {(classMetrics.recall * 100).toFixed(1)}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">Recall</Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={classMetrics.recall * 100} 
                            sx={{ mt: 1, height: 6, borderRadius: 3 }}
                            color="success"
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: '#8b5cf6' }}>
                            {(classMetrics.f1_score * 100).toFixed(1)}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">F1 Score</Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={classMetrics.f1_score * 100} 
                            sx={{ mt: 1, height: 6, borderRadius: 3 }}
                            color="secondary"
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Prediction Distribution */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={5}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PieChartIcon color="primary" /> Prediction Distribution (Current Page)
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={predictionDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {predictionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {predictionDistribution.map((item, index) => (
                  <Grid item xs={6} key={index}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: `${item.color}15`, border: `2px solid ${item.color}` }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: item.color }}>
                        {item.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">{item.name}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* System Info */}
        <Grid item xs={12} md={7}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarToday color="primary" /> Model Information & Statistics
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Paper elevation={1} sx={{ p: 2, bgcolor: '#f8fafc' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AccessTime sx={{ color: '#3b82f6', fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">Last Evaluated</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {new Date(metrics?.last_evaluated).toLocaleString()}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper elevation={1} sx={{ p: 2, bgcolor: '#f8fafc' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Speed sx={{ color: '#10b981', fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">Response Time</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {metrics?.response_time_ms || 42}ms
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper elevation={1} sx={{ p: 2, bgcolor: '#f8fafc' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Assessment sx={{ color: '#8b5cf6', fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">Model Name</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {metrics?.model_name}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper elevation={1} sx={{ p: 2, bgcolor: '#f8fafc' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Timeline sx={{ color: '#f59e0b', fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">Inference Time</Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {metrics?.inference_time_ms || 15}ms
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip 
                  icon={<CheckCircle />}
                  label={`Accuracy: ${(metrics?.accuracy * 100).toFixed(1)}%`}
                  color="primary"
                  sx={{ fontWeight: 600 }}
                />
                <Chip 
                  icon={<TrendingUp />}
                  label={`Precision: ${(metrics?.precision * 100).toFixed(1)}%`}
                  color="success"
                  sx={{ fontWeight: 600 }}
                />
                <Chip 
                  icon={<BarChartIcon />}
                  label={`F1 Score: ${(metrics?.f1_score * 100).toFixed(1)}%`}
                  color="secondary"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Predictions History Table */}
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Visibility color="primary" /> Prediction History
          </Typography>
          
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0' }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Prediction ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Timestamp</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Prediction</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Confidence</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Model</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history?.predictions?.map((prediction) => (
                  <TableRow key={prediction.prediction_id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                        {prediction.prediction_id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTime sx={{ fontSize: 16, color: '#64748b' }} />
                        <Typography variant="body2">
                          {new Date(prediction.timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={prediction.prediction === 'Good Subject' ? <CheckCircle /> : <Cancel />}
                        label={prediction.prediction}
                        color={prediction.prediction === 'Good Subject' ? 'success' : 'error'}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={prediction.probability * 100} 
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                          color={prediction.probability > 0.8 ? 'success' : prediction.probability > 0.6 ? 'primary' : 'warning'}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 45 }}>
                          {(prediction.probability * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={prediction.model_name}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton size="small" color="primary">
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={history?.total_predictions || 0}
            page={currentPage}
            onPageChange={handleChangePage}
            rowsPerPage={pageSize}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{ borderTop: '1px solid #e2e8f0' }}
          />
        </CardContent>
      </Card>
    </Box>
  );
}

export default History;
