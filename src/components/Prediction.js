import React, { useState, useEffect } from 'react';
import { predictSingle, predictBatch, getPredictionsHistory } from '../api';
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
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
} from '@mui/material';
import {
  PlayArrow,
  ContentPaste,
  CheckCircle,
  Cancel,
  TrendingUp,
  Assessment,
  Search,
  Close,
  History as HistoryIcon,
  Visibility,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b'];

function Prediction() {
  const [predictionType, setPredictionType] = useState('single');
  const [inputData, setInputData] = useState('');
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // History states
  const [historyData, setHistoryData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Fetch prediction history on component mount
  useEffect(() => {
    fetchHistory();
  }, [currentPage]);

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const data = await getPredictionsHistory(currentPage, pageSize);
      setHistoryData(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

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
      // Refresh history after successful prediction
      fetchHistory();
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

  // Prepare chart data for batch predictions
  const chartData = predictionResult && predictionType === 'batch' ? [
    { name: 'Good Subject', value: predictionResult.summary?.good_subjects || 0 },
    { name: 'Bad Subject', value: predictionResult.summary?.bad_subjects || 0 },
  ] : [];

  const confidenceData = predictionResult && predictionType === 'batch' 
    ? predictionResult.predictions?.reduce((acc, pred) => {
        const conf = pred.confidence;
        acc[conf] = (acc[conf] || 0) + 1;
        return acc;
      }, {})
    : {};

  const confidenceChartData = Object.entries(confidenceData).map(([key, value]) => ({
    confidence: key,
    count: value
  }));

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Assessment color="primary" /> Prediction
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Make single or batch predictions using the adherence prediction model
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Prediction Type Selection */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Prediction Type
          </Typography>
          <ToggleButtonGroup
            value={predictionType}
            exclusive
            onChange={(e, newType) => {
              if (newType) {
                setPredictionType(newType);
                setPredictionResult(null);
                setInputData('');
              }
            }}
            aria-label="prediction type"
          >
            <ToggleButton value="single" aria-label="single prediction">
              <TrendingUp sx={{ mr: 1 }} />
              Single Prediction
            </ToggleButton>
            <ToggleButton value="batch" aria-label="batch prediction">
              <Assessment sx={{ mr: 1 }} />
              Batch Prediction
            </ToggleButton>
          </ToggleButtonGroup>
        </CardContent>
      </Card>

      {/* Input Data */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Input Data ({predictionType})
            </Typography>
            <Button
              variant="outlined"
              startIcon={<ContentPaste />}
              onClick={loadSample}
            >
              Load Sample
            </Button>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter JSON data {predictionType === 'batch' ? '(array of objects)' : '(single object)'}
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={15}
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            placeholder={JSON.stringify(
              predictionType === 'single' ? sampleSingleInput : sampleBatchInput,
              null,
              2
            )}
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
            onClick={handlePredict}
            disabled={loading || !inputData}
          >
            {loading ? 'Predicting...' : 'Make Prediction'}
          </Button>
        </CardContent>
      </Card>

      {/* Prediction Results */}
      {predictionResult && predictionType === 'single' && (
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Prediction Result
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
                      Prediction
                    </Typography>
                    <Chip
                      label={predictionResult.prediction}
                      sx={{
                        backgroundColor: predictionResult.prediction === 'Good Subject' ? '#10b981' : '#ef4444',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '14px',
                        height: '32px'
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
                      Probability
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {(predictionResult.probability * 100).toFixed(1)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
                      Confidence
                    </Typography>
                    <Chip
                      label={predictionResult.confidence}
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '14px',
                        height: '32px'
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3 }}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Class Label:</strong> {predictionResult.class_label}
                </Typography>
                <Typography variant="body1">
                  <strong>Timestamp:</strong> {new Date(predictionResult.timestamp).toLocaleString()}
                </Typography>
              </Paper>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Batch Prediction Results */}
      {predictionResult && predictionType === 'batch' && (
        <>
          <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Batch Prediction Summary
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
                        Total Records
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {predictionResult.summary?.total_records}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: 'white', height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
                        Good Subjects
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {predictionResult.summary?.good_subjects}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ background: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)', color: 'white', height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
                        Bad Subjects
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>
                        {predictionResult.summary?.bad_subjects}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Charts */}
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ p: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Prediction Distribution
                    </Typography>
                    <PieChart width={300} height={250}>
                      <Pie
                        data={chartData}
                        cx={150}
                        cy={125}
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper elevation={2} sx={{ p: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Confidence Distribution
                    </Typography>
                    <BarChart width={300} height={250} data={confidenceChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Individual Predictions
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Prediction</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Probability</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Confidence</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Timestamp</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {predictionResult.predictions?.map((pred, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{pred.MASK_ID}</TableCell>
                        <TableCell>
                          <Chip
                            label={pred.prediction}
                            color={pred.prediction === 'Good Subject' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{(pred.probability * 100).toFixed(1)}%</TableCell>
                        <TableCell>
                          <Chip label={pred.confidence} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>{new Date(pred.timestamp).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </CardContent>
          </Card>
        </>
      )}

      {/* Prediction History Section */}
      <Card elevation={2} sx={{ mt: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <HistoryIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Prediction History
              </Typography>
              <Chip 
                label={`${historyData?.total_predictions || 0} Total`}
                size="small"
                color="primary"
              />
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={fetchHistory}
              disabled={historyLoading}
            >
              {historyLoading ? <CircularProgress size={20} /> : 'Refresh'}
            </Button>
          </Box>

          {/* Search Bar */}
          <TextField
            fullWidth
            size="small"
            placeholder="Search by Prediction ID, Model, or Prediction..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <Close />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* History Table */}
          {historyLoading && !historyData ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Paper elevation={1} sx={{ overflow: 'hidden' }}>
                <Box sx={{ overflowX: 'auto' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Prediction ID</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Timestamp</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Prediction</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Probability</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Model</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {historyData?.predictions
                        ?.filter(pred => {
                          if (!searchTerm) return true;
                          const search = searchTerm.toLowerCase();
                          return (
                            pred.prediction_id?.toLowerCase().includes(search) ||
                            pred.prediction?.toLowerCase().includes(search) ||
                            pred.model_name?.toLowerCase().includes(search)
                          );
                        })
                        .map((pred) => (
                          <TableRow 
                            key={pred.prediction_id} 
                            hover
                            sx={{ 
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: '#f8fafc'
                              }
                            }}
                          >
                            <TableCell>
                              <code style={{ 
                                backgroundColor: '#f1f5f9', 
                                padding: '4px 8px', 
                                borderRadius: '4px',
                                fontSize: '13px'
                              }}>
                                {pred.prediction_id}
                              </code>
                            </TableCell>
                            <TableCell>
                              {new Date(pred.timestamp).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={pred.prediction}
                                color={pred.prediction === 'Good Subject' ? 'success' : 'error'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={`${(pred.probability * 100).toFixed(1)}%`}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>{pred.model_name}</TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => {
                                  setSelectedPrediction(pred);
                                  setDialogOpen(true);
                                }}
                              >
                                <Visibility />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </Box>
              </Paper>

              {/* Pagination */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, historyData?.total_predictions || 0)} of {historyData?.total_predictions || 0}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage * pageSize >= (historyData?.total_predictions || 0)}
                  >
                    Next
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Prediction Detail Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Visibility />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Prediction Details
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => setDialogOpen(false)}
            sx={{ color: 'white' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedPrediction && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
                      Prediction ID
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                      {selectedPrediction.prediction_id}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper elevation={1} sx={{ p: 2, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                    <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
                      Timestamp
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {new Date(selectedPrediction.timestamp).toLocaleString()}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 2, textAlign: 'center', background: '#f8fafc' }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Prediction
                    </Typography>
                    <Chip
                      label={selectedPrediction.prediction}
                      color={selectedPrediction.prediction === 'Good Subject' ? 'success' : 'error'}
                      sx={{ fontWeight: 600 }}
                    />
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 2, textAlign: 'center', background: '#f8fafc' }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Probability
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                      {(selectedPrediction.probability * 100).toFixed(1)}%
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 2, textAlign: 'center', background: '#f8fafc' }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Model
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedPrediction.model_name}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>

              {selectedPrediction.input_data && (
                <Paper elevation={1} sx={{ p: 2, mb: 2, background: '#f8fafc' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Input Data
                  </Typography>
                  <Paper elevation={0} sx={{ p: 2, backgroundColor: 'white', maxHeight: 300, overflow: 'auto' }}>
                    <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '12px' }}>
                      {JSON.stringify(selectedPrediction.input_data, null, 2)}
                    </pre>
                  </Paper>
                </Paper>
              )}

              {selectedPrediction.metadata && (
                <Paper elevation={1} sx={{ p: 2, background: '#f8fafc' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Additional Metadata
                  </Typography>
                  <Grid container spacing={1}>
                    {Object.entries(selectedPrediction.metadata).map(([key, value]) => (
                      <Grid item xs={12} key={key}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #e5e7eb' }}>
                          <Typography variant="body2" color="text.secondary">
                            {key}:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Prediction;
