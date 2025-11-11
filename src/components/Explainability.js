import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  LinearProgress,
} from '@mui/material';
import {
  Lightbulb,
  ContentPaste,
  PlayArrow,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
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
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Lightbulb sx={{ fontSize: 32, mr: 1, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Explainability
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Understand which features influence the model's predictions
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Input Data */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Input Data for Explanation
            </Typography>
            <Button
              variant="outlined"
              startIcon={<ContentPaste />}
              onClick={() => setInputData(JSON.stringify(sampleInput, null, 2))}
            >
              Load Sample
            </Button>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter JSON data:
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={10}
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            placeholder={JSON.stringify(sampleInput, null, 2)}
            variant="outlined"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                fontFamily: 'monospace',
                fontSize: '13px',
              }
            }}
          />

          <Button
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
            onClick={handleExplain}
            disabled={loading || !inputData}
          >
            {loading ? 'Generating Explanation...' : 'Explain Prediction'}
          </Button>
        </CardContent>
      </Card>

      {/* Explanation Results */}
      {explanation && (
        <>
          {/* Prediction Overview */}
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Prediction Overview
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
                        Prediction
                      </Typography>
                      <Chip
                        label={explanation.prediction}
                        sx={{
                          backgroundColor: explanation.prediction === 'Good Subject' ? '#10b981' : '#ef4444',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '14px',
                          height: '32px'
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
                        Probability
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {(explanation.probability * 100).toFixed(1)}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Feature Importance */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Positive Features */}
            <Grid item xs={12} md={6}>
              <Card elevation={2} sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUp sx={{ color: 'success.main', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Top Positive Features
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Features that increase the likelihood of completion
                  </Typography>
                  <Paper elevation={1} sx={{ overflow: 'hidden' }}>
                    <Box sx={{ overflowX: 'auto' }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Feature</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Value</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Impact</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {explanation.explanation?.top_positive_features?.map((feature, index) => (
                            <TableRow key={index} hover>
                              <TableCell>
                                <code style={{ 
                                  backgroundColor: '#f1f5f9', 
                                  padding: '2px 6px', 
                                  borderRadius: '4px',
                                  fontSize: '12px'
                                }}>
                                  {feature.feature}
                                </code>
                              </TableCell>
                              <TableCell>{feature.value}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={`+${feature.impact.toFixed(3)}`}
                                  size="small"
                                  sx={{ 
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    fontWeight: 600
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  </Paper>
                </CardContent>
              </Card>
            </Grid>

            {/* Negative Features */}
            <Grid item xs={12} md={6}>
              <Card elevation={2} sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingDown sx={{ color: 'error.main', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Top Negative Features
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Features that decrease the likelihood of completion
                  </Typography>
                  <Paper elevation={1} sx={{ overflow: 'hidden' }}>
                    <Box sx={{ overflowX: 'auto' }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Feature</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Value</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Impact</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {explanation.explanation?.top_negative_features?.map((feature, index) => (
                            <TableRow key={index} hover>
                              <TableCell>
                                <code style={{ 
                                  backgroundColor: '#f1f5f9', 
                                  padding: '2px 6px', 
                                  borderRadius: '4px',
                                  fontSize: '12px'
                                }}>
                                  {feature.feature}
                                </code>
                              </TableCell>
                              <TableCell>{feature.value}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={feature.impact.toFixed(3)}
                                  size="small"
                                  sx={{ 
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    fontWeight: 600
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  </Paper>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* SHAP Values with Chart */}
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                SHAP Values
              </Typography>
              <Paper elevation={1} sx={{ p: 2, mb: 2, backgroundColor: '#f8fafc' }}>
                <Typography variant="body1">
                  <strong>Base Value:</strong> {explanation.explanation?.shap_values?.base_value?.toFixed(3)}
                </Typography>
              </Paper>

              {/* SHAP Values Chart */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Feature Contributions
                    </Typography>
                    <BarChart
                      width={400}
                      height={300}
                      data={Object.entries(explanation.explanation?.shap_values?.features || {}).map(([feature, value]) => ({
                        feature: feature.length > 15 ? feature.substring(0, 15) + '...' : feature,
                        value: parseFloat(value.toFixed(3))
                      }))}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="feature" type="category" style={{ fontSize: '12px' }} />
                      <Tooltip />
                      <Bar dataKey="value">
                        {Object.entries(explanation.explanation?.shap_values?.features || {}).map(([feature, value], index) => (
                          <Cell key={`cell-${index}`} fill={value > 0 ? '#10b981' : '#ef4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ overflow: 'hidden' }}>
                    <Box sx={{ overflowY: 'auto', maxHeight: '300px' }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Feature</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>SHAP Value</TableCell>
                            <TableCell sx={{ fontWeight: 600, width: '150px' }}>Visual</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Object.entries(explanation.explanation?.shap_values?.features || {}).map(([feature, value]) => (
                            <TableRow key={feature} hover>
                              <TableCell>
                                <code style={{ 
                                  backgroundColor: '#f1f5f9', 
                                  padding: '2px 6px', 
                                  borderRadius: '4px',
                                  fontSize: '11px'
                                }}>
                                  {feature}
                                </code>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={value.toFixed(3)}
                                  size="small"
                                  color={value > 0 ? 'success' : 'error'}
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ width: '100%' }}>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={Math.min(Math.abs(value) * 100, 100)}
                                    sx={{
                                      height: 8,
                                      borderRadius: 1,
                                      backgroundColor: '#f1f5f9',
                                      '& .MuiLinearProgress-bar': {
                                        backgroundColor: value > 0 ? '#10b981' : '#ef4444'
                                      }
                                    }}
                                  />
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Explanation Info */}
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                About SHAP Values
              </Typography>
              <Paper elevation={1} sx={{ p: 2, backgroundColor: '#f8fafc' }}>
                <Typography variant="body2" sx={{ lineHeight: 1.8, color: '#475569' }}>
                  SHAP (SHapley Additive exPlanations) values show how much each feature contributes to the 
                  prediction. Positive values (in green) push the prediction toward "Good Subject" (treatment completion), 
                  while negative values (in red) push toward "Bad Subject" (treatment non-completion). 
                  The base value represents the average model output, and each feature's SHAP value shows 
                  its deviation from this baseline.
                </Typography>
              </Paper>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}

export default Explainability;
