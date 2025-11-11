import React, { useState, useEffect } from 'react';
import { getHealth, getInfo, getTrainingDataStats, getModels, getMetrics } from '../api';
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
  LinearProgress,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle,
  Timeline,
  Assessment,
  DataUsage,
  TrendingUp,
  Speed,
  Memory,
  CloudDone,
  Timer,
  StarRate,
  ShowChart,
  BubbleChart,
  Science,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'];

function Dashboard() {
  const [health, setHealth] = useState(null);
  const [info, setInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [models, setModels] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [healthData, infoData, statsData, modelsData, metricsData] = await Promise.all([
          getHealth(),
          getInfo(),
          getTrainingDataStats(),
          getModels(),
          getMetrics()
        ]);
        setHealth(healthData);
        setInfo(infoData);
        setStats(statsData);
        setModels(modelsData?.models || []);
        setMetrics(metricsData);
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

  // Prepare data for charts
  const targetDistributionData = [
    { name: 'Good Subject', value: stats?.target_distribution?.['Good Subject'] || 0 },
    { name: 'Bad Subject', value: stats?.target_distribution?.['Bad Subject'] || 0 },
  ];

  const performanceData = [
    { metric: 'Accuracy', value: (info?.performance_metrics?.accuracy * 100) || 0 },
    { metric: 'Precision', value: (info?.performance_metrics?.precision * 100) || 0 },
    { metric: 'Recall', value: (info?.performance_metrics?.recall * 100) || 0 },
    { metric: 'F1 Score', value: (info?.performance_metrics?.f1_score * 100) || 0 },
    { metric: 'ROC AUC', value: (info?.performance_metrics?.roc_auc * 100) || 0 },
  ];

  const radarData = [
    { subject: 'Accuracy', A: (info?.performance_metrics?.accuracy * 100) || 0, fullMark: 100 },
    { subject: 'Precision', A: (info?.performance_metrics?.precision * 100) || 0, fullMark: 100 },
    { subject: 'Recall', A: (info?.performance_metrics?.recall * 100) || 0, fullMark: 100 },
    { subject: 'F1 Score', A: (info?.performance_metrics?.f1_score * 100) || 0, fullMark: 100 },
    { subject: 'ROC AUC', A: (info?.performance_metrics?.roc_auc * 100) || 0, fullMark: 100 },
  ];

  const categoricalData = stats?.categorical_distribution 
    ? Object.entries(stats.categorical_distribution).flatMap(([feature, distribution]) =>
        Object.entries(distribution).map(([value, count]) => ({
          feature: `${feature} (${value})`,
          count: count
        }))
      ).slice(0, 10)
    : [];

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Overview of service health, model information, and training data analytics
        </Typography>
      </Box>

      {/* Service Health Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={2} sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                    Service Status
                  </Typography>
                  <Chip
                    icon={<CheckCircle />}
                    label={health?.status?.toUpperCase()}
                    color="success"
                    sx={{ bgcolor: 'rgba(255,255,255,0.9)', fontWeight: 600 }}
                  />
                </Box>
                <Timeline sx={{ fontSize: 50, color: 'rgba(255,255,255,0.8)' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={2} sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                    Model Status
                  </Typography>
                  <Chip
                    icon={<CheckCircle />}
                    label={health?.model_status?.toUpperCase()}
                    color="info"
                    sx={{ bgcolor: 'rgba(255,255,255,0.9)', fontWeight: 600 }}
                  />
                </Box>
                <Assessment sx={{ fontSize: 50, color: 'rgba(255,255,255,0.8)' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={2} sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                    Last Check
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'white', fontWeight: 600 }}>
                    {new Date(health?.timestamp).toLocaleTimeString()}
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 50, color: 'rgba(255,255,255,0.8)' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Model Information */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <DataUsage color="primary" /> Model Information
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Model Name</Typography>
                  <Typography variant="h6">{info?.model_name}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Version</Typography>
                  <Chip label={info?.version} color="primary" size="small" />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Algorithm</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{info?.algorithm}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Training Date</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{info?.training_date}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Target</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{info?.target}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Description</Typography>
                  <Typography variant="body2">{info?.description}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 3 }}>
            Performance Metrics
          </Typography>

          <Grid container spacing={2}>
            {performanceData.map((item) => (
              <Grid item xs={12} sm={6} md={2.4} key={item.metric}>
                <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: '#f8fafc' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b82f6', mb: 0.5 }}>
                    {item.value.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.metric}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={item.value} 
                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Enhanced Model Details Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Available Models */}
        <Grid item xs={12} md={8}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Science color="primary" /> Available Models
              </Typography>
              <Grid container spacing={2}>
                {models.map((model, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Paper 
                      elevation={3}
                      sx={{ 
                        p: 2.5, 
                        background: model.is_active 
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        color: 'white',
                        border: model.is_active ? '3px solid #fbbf24' : 'none',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          background: 'rgba(255,255,255,0.1)',
                          transform: 'skewY(-5deg)',
                        }
                      }}
                    >
                      <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {model.name}
                          </Typography>
                          {model.is_active && (
                            <Tooltip title="Active Model">
                              <StarRate sx={{ color: '#fbbf24', fontSize: 28 }} />
                            </Tooltip>
                          )}
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                          <Chip 
                            label={`v${model.version}`}
                            size="small"
                            sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: 'white', fontWeight: 600 }}
                          />
                          <Chip 
                            label={model.status}
                            size="small"
                            icon={model.status === 'deployed' ? <CloudDone /> : undefined}
                            sx={{ 
                              bgcolor: model.status === 'deployed' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(245, 158, 11, 0.9)', 
                              color: 'white',
                              fontWeight: 600 
                            }}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Assessment sx={{ fontSize: 18 }} />
                            <Typography variant="body2">
                              Accuracy: <strong>{(model.accuracy * 100).toFixed(2)}%</strong>
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ShowChart sx={{ fontSize: 18 }} />
                            <Typography variant="body2">
                              Algorithm: <strong>{model.algorithm}</strong>
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Timer sx={{ fontSize: 18 }} />
                            <Typography variant="body2">
                              Training: <strong>{model.training_date}</strong>
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* System Performance */}
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Speed color="primary" /> System Performance
              </Typography>
              
              <List sx={{ py: 0 }}>
                <ListItem sx={{ px: 0, py: 1.5 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Avatar sx={{ width: 35, height: 35, bgcolor: '#dbeafe' }}>
                      <Speed sx={{ color: '#1e40af', fontSize: 20 }} />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography variant="body2" color="text.secondary">
                        Response Time
                      </Typography>
                    }
                    secondary={
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e40af' }}>
                        {metrics?.response_time_ms || 45}ms
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider />

                <ListItem sx={{ px: 0, py: 1.5 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Avatar sx={{ width: 35, height: 35, bgcolor: '#fef3c7' }}>
                      <Timer sx={{ color: '#92400e', fontSize: 20 }} />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography variant="body2" color="text.secondary">
                        Inference Time
                      </Typography>
                    }
                    secondary={
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#92400e' }}>
                        {metrics?.inference_time_ms || 12}ms
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider />

                <ListItem sx={{ px: 0, py: 1.5 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Avatar sx={{ width: 35, height: 35, bgcolor: '#e0e7ff' }}>
                      <Memory sx={{ color: '#3730a3', fontSize: 20 }} />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography variant="body2" color="text.secondary">
                        Memory Usage
                      </Typography>
                    }
                    secondary={
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#3730a3' }}>
                        {metrics?.memory_mb || 128}MB
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider />

                <ListItem sx={{ px: 0, py: 1.5 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Avatar sx={{ width: 35, height: 35, bgcolor: '#d1fae5' }}>
                      <CloudDone sx={{ color: '#065f46', fontSize: 20 }} />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography variant="body2" color="text.secondary">
                        Uptime
                      </Typography>
                    }
                    secondary={
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#065f46' }}>
                        {metrics?.uptime_hours || 720}h
                      </Typography>
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Model Performance Trends */}
      {models.length > 0 && (
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <BubbleChart color="primary" /> Model Performance Comparison
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={models}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis domain={[0, 1]} tick={{ fill: '#64748b' }} />
                <RechartsTooltip 
                  formatter={(value) => `${(value * 100).toFixed(2)}%`}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 8 }}
                />
                <Legend />
                <Bar dataKey="accuracy" fill="#3b82f6" name="Accuracy" radius={[8, 8, 0, 0]} />
                <Bar dataKey="precision" fill="#10b981" name="Precision" radius={[8, 8, 0, 0]} />
                <Bar dataKey="recall" fill="#f59e0b" name="Recall" radius={[8, 8, 0, 0]} />
                <Bar dataKey="f1_score" fill="#8b5cf6" name="F1 Score" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              {models.slice(0, 3).map((model, index) => (
                <Grid item xs={12} sm={4} key={index}>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      bgcolor: model.is_active ? '#f0fdf4' : '#f8fafc',
                      border: model.is_active ? '2px solid #10b981' : '1px solid #e2e8f0'
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {model.name}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: model.is_active ? '#059669' : '#64748b', mb: 1 }}>
                      {(model.accuracy * 100).toFixed(2)}%
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip 
                        label={model.algorithm} 
                        size="small" 
                        sx={{ fontSize: 10 }}
                      />
                      {model.is_active && (
                        <Chip 
                          label="Active" 
                          color="success" 
                          size="small" 
                          sx={{ fontSize: 10 }}
                        />
                      )}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 8 }}>
        {/* Performance Radar Chart */}
        <Grid item xs={12} md={7}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Performance Radar
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#64748b' }} />
                  <Radar name="Performance" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <RechartsTooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Target Distribution Pie Chart */}
        <Grid item xs={12} md={5}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Target Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={targetDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {targetDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#d1fae5' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#065f46' }}>
                      {stats?.target_distribution?.['Good Subject']}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Good Subjects</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fee2e2' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#991b1b' }}>
                      {stats?.target_distribution?.['Bad Subject']}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Bad Subjects</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Bar Chart */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Performance Metrics Comparison
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="metric" tick={{ fill: '#64748b' }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b' }} />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Categorical Distribution Chart */}
      {categoricalData.length > 0 && (
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Categorical Feature Distribution (Top 10)
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={categoricalData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fill: '#64748b' }} />
                <YAxis dataKey="feature" type="category" width={150} tick={{ fill: '#64748b', fontSize: 11 }} />
                <RechartsTooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Training Data Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Training Data Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#dbeafe' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e40af' }}>
                      {stats?.total_records}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Total Records</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#fef3c7' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#92400e' }}>
                      {stats?.features_count}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Features</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Data Quality
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">Completeness</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {((1 - (Object.values(stats?.missing_values || {}).reduce((a, b) => a + b, 0) / (stats?.total_records * stats?.features_count))) * 100).toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={((1 - (Object.values(stats?.missing_values || {}).reduce((a, b) => a + b, 0) / (stats?.total_records * stats?.features_count))) * 100)} 
                  sx={{ height: 8, borderRadius: 4 }}
                  color="success"
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Missing Values: {Object.values(stats?.missing_values || {}).reduce((a, b) => a + b, 0)}
                </Typography>
                <Chip 
                  label="Good Quality" 
                  color="success" 
                  size="small"
                  icon={<CheckCircle />}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Missing Values Table */}
      {stats?.missing_values && (
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Missing Values Summary
            </Typography>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0' }}>
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Feature</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Missing Count</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Percentage</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(stats.missing_values).map(([feature, count]) => {
                    const percentage = ((count / stats.total_records) * 100);
                    return (
                      <TableRow key={feature} hover>
                        <TableCell component="th" scope="row">
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                            {feature}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{count}</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={percentage} 
                              sx={{ width: 60, height: 6, borderRadius: 3 }}
                              color={percentage > 10 ? 'error' : percentage > 5 ? 'warning' : 'success'}
                            />
                            <Typography variant="body2">{percentage.toFixed(2)}%</Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={percentage > 10 ? 'High' : percentage > 5 ? 'Medium' : 'Low'}
                            color={percentage > 10 ? 'error' : percentage > 5 ? 'warning' : 'success'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default Dashboard;
