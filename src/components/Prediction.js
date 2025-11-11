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
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Tabs,
  Tab,
} from '@mui/material';
import {
  PlayArrow,
  ContentPaste,
  TrendingUp,
  Assessment,
  Search,
  Close,
  History as HistoryIcon,
  Visibility,
  UploadFile,
  Edit,
  Code,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
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
  
  // Input method states
  const [inputMethod, setInputMethod] = useState('json'); // 'json' or 'form' or 'csv'
  const [formData, setFormData] = useState({
    PERFORMANCE_ID: '',
    Hx_oth_cancer: '',
    stable_weigh: '',
    examed_by_radiation_oncologist: '',
    bilateral_renal_function: '',
    No_cardiact_condition: '',
    prior_chemo: '',
    prior_radiation: '',
    Gastro_esophageal_junction: '',
    cardia: '',
    fundus: '',
    body_corpus: '',
    antrum: '',
    pylorus_pyloric_channel: '',
    greater_curvature: '',
    lesser_curvature: '',
    stomach_NOS: '',
    Histologic_grade: '',
    num_lymph_node_examined: '',
    num_pos_lymph_node: '',
    T_stage: '',
    N_stage: '',
    M_stage: '',
    T2N0M0_spec: '',
    PD_location: '',
    ETHNIC_ID: '',
    SEX_ID: '',
    RACE_ID: '',
    TREAT_ASSIGNED: '',
    STRATUM_GRP_ID: '',
    agecat: ''
  });
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCsvUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setCsvFile(file);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        
        const parsedData = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const obj = {};
          headers.forEach((header, index) => {
            const value = values[index];
            // Convert to number if possible, otherwise keep as string
            obj[header] = isNaN(value) || value === '' ? value : Number(value);
          });
          return obj;
        });

        setCsvData(parsedData);
        setError(null);
      } catch (err) {
        setError('Failed to parse CSV file. Please check the format.');
        console.error(err);
      }
    };

    reader.readAsText(file);
  };

  const handlePredict = async () => {
    try {
      setLoading(true);
      setError(null);

      let parsedData;
      
      if (predictionType === 'single') {
        if (inputMethod === 'form') {
          // Use form data
          parsedData = { ...formData };
          // Convert string values to numbers where appropriate
          Object.keys(parsedData).forEach(key => {
            const value = parsedData[key];
            if (value !== '' && !isNaN(value)) {
              parsedData[key] = Number(value);
            } else if (value === '' || value === null) {
              parsedData[key] = null;
            }
          });
        } else {
          // Use JSON input
          parsedData = JSON.parse(inputData);
        }
        const result = await predictSingle(parsedData);
        setPredictionResult(result);
      } else {
        // Batch predictions
        if (inputMethod === 'csv') {
          // Use CSV data
          if (csvData.length === 0) {
            setError('Please upload a CSV file first');
            return;
          }
          parsedData = csvData;
        } else {
          // Use JSON input
          parsedData = JSON.parse(inputData);
          parsedData = Array.isArray(parsedData) ? parsedData : [parsedData];
        }
        const result = await predictBatch(parsedData);
        setPredictionResult(result);
      }

      // Refresh history after successful prediction
      fetchHistory();
    } catch (err) {
      setError('Invalid input format or prediction failed: ' + err.message);
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
      if (inputMethod === 'form') {
        setFormData({
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
        });
      } else {
        setInputData(JSON.stringify(sampleSingleInput, null, 2));
      }
    } else {
      setInputData(JSON.stringify(sampleBatchInput, null, 2));
    }
  };

  // Field configurations for form
  const fieldConfigs = {
    PERFORMANCE_ID: { label: 'Performance Status', type: 'select', options: [0, 1, 2] },
    Hx_oth_cancer: { label: 'History of Other Cancer', type: 'select', options: [0, 1] },
    stable_weigh: { label: 'Stable Weight', type: 'select', options: [1, 2] },
    examed_by_radiation_oncologist: { label: 'Examined by Radiation Oncologist', type: 'select', options: [0, 1] },
    bilateral_renal_function: { label: 'Bilateral Renal Function', type: 'select', options: [0, 1] },
    No_cardiact_condition: { label: 'No Cardiac Condition', type: 'select', options: [0, 1] },
    prior_chemo: { label: 'Prior Chemotherapy', type: 'select', options: [0, 1] },
    prior_radiation: { label: 'Prior Radiation', type: 'select', options: [0, 1] },
    Gastro_esophageal_junction: { label: 'Gastroesophageal Junction', type: 'select', options: [0, 1] },
    cardia: { label: 'Cardia', type: 'select', options: [0, 1] },
    fundus: { label: 'Fundus', type: 'select', options: [0, 1] },
    body_corpus: { label: 'Body/Corpus', type: 'select', options: [0, 1] },
    antrum: { label: 'Antrum', type: 'select', options: [0, 1] },
    pylorus_pyloric_channel: { label: 'Pylorus/Pyloric Channel', type: 'select', options: [0, 1] },
    greater_curvature: { label: 'Greater Curvature', type: 'select', options: [0, 1] },
    lesser_curvature: { label: 'Lesser Curvature', type: 'select', options: [0, 1] },
    stomach_NOS: { label: 'Stomach NOS', type: 'select', options: [0, 1] },
    Histologic_grade: { label: 'Histologic Grade', type: 'select', options: [1, 2, 3, 4] },
    num_lymph_node_examined: { label: 'Number of Lymph Nodes Examined', type: 'number', min: 0 },
    num_pos_lymph_node: { label: 'Number of Positive Lymph Nodes', type: 'number', min: 0 },
    T_stage: { label: 'T Stage', type: 'select', options: [0, 1, 2, 3, 4] },
    N_stage: { label: 'N Stage', type: 'select', options: [0, 1, 2, 3] },
    M_stage: { label: 'M Stage', type: 'select', options: [0, 1] },
    T2N0M0_spec: { label: 'T2N0M0 Specification', type: 'select', options: [1, 2, 3] },
    PD_location: { label: 'PD Location', type: 'text' },
    ETHNIC_ID: { label: 'Ethnicity', type: 'select', options: [1, 2, 3] },
    SEX_ID: { label: 'Sex', type: 'select', options: [1, 2] },
    RACE_ID: { label: 'Race', type: 'select', options: [1, 2, 3, 4, 5] },
    TREAT_ASSIGNED: { label: 'Treatment Assigned', type: 'select', options: [1, 2] },
    STRATUM_GRP_ID: { label: 'Stratum Group', type: 'select', options: [1, 2, 3] },
    agecat: { label: 'Age Category', type: 'select', options: [1, 2, 3, 4] }
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

          {/* Input Method Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={inputMethod} 
              onChange={(e, newValue) => {
                setInputMethod(newValue);
                setPredictionResult(null);
              }}
              aria-label="input method tabs"
            >
              <Tab 
                icon={<Code />} 
                iconPosition="start" 
                label="JSON Input" 
                value="json" 
              />
              {predictionType === 'single' && (
                <Tab 
                  icon={<Edit />} 
                  iconPosition="start" 
                  label="Form Input" 
                  value="form" 
                />
              )}
              {predictionType === 'batch' && (
                <Tab 
                  icon={<UploadFile />} 
                  iconPosition="start" 
                  label="CSV Upload" 
                  value="csv" 
                />
              )}
            </Tabs>
          </Box>

          {/* JSON Input */}
          {inputMethod === 'json' && (
            <Box>
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
            </Box>
          )}

          {/* Form Input (Single Prediction Only) */}
          {inputMethod === 'form' && predictionType === 'single' && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                Fill in the form below to make a prediction. Required fields are marked with *.
              </Alert>
              
              <Grid container spacing={2}>
                {Object.entries(fieldConfigs).map(([fieldName, config]) => (
                  <Grid item xs={12} sm={6} md={4} key={fieldName}>
                    {config.type === 'select' ? (
                      <FormControl fullWidth size="small">
                        <InputLabel>{config.label}</InputLabel>
                        <Select
                          value={formData[fieldName]}
                          label={config.label}
                          onChange={(e) => handleFormChange(fieldName, e.target.value)}
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          {config.options.map(option => (
                            <MenuItem key={option} value={option}>
                              {option === 0 ? 'No' : option === 1 ? 'Yes' : option}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>{fieldName}</FormHelperText>
                      </FormControl>
                    ) : config.type === 'number' ? (
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label={config.label}
                        value={formData[fieldName]}
                        onChange={(e) => handleFormChange(fieldName, e.target.value)}
                        inputProps={{ min: config.min || 0 }}
                        helperText={fieldName}
                      />
                    ) : (
                      <TextField
                        fullWidth
                        size="small"
                        label={config.label}
                        value={formData[fieldName] || ''}
                        onChange={(e) => handleFormChange(fieldName, e.target.value)}
                        helperText={fieldName}
                      />
                    )}
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* CSV Upload (Batch Prediction Only) */}
          {inputMethod === 'csv' && predictionType === 'batch' && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                Upload a CSV file containing multiple records for batch prediction. 
                The first row should contain column headers matching the model's expected features.
                <Button
                  size="small"
                  variant="outlined"
                  sx={{ ml: 2 }}
                  href="/sample_batch_prediction.csv"
                  download="sample_batch_prediction.csv"
                >
                  Download Sample CSV
                </Button>
              </Alert>

              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  textAlign: 'center',
                  border: '2px dashed #cbd5e1',
                  bgcolor: '#f8fafc',
                  mb: 3,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: '#f1f5f9',
                    borderColor: '#94a3b8'
                  }
                }}
              >
                <input
                  accept=".csv"
                  style={{ display: 'none' }}
                  id="csv-upload-input"
                  type="file"
                  onChange={handleCsvUpload}
                />
                <label htmlFor="csv-upload-input">
                  <Box sx={{ cursor: 'pointer' }}>
                    <UploadFile sx={{ fontSize: 48, color: '#64748b', mb: 2 }} />
                    <Typography variant="h6" sx={{ mb: 1, color: '#475569' }}>
                      {csvFile ? csvFile.name : 'Click to upload CSV file'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      or drag and drop your file here
                    </Typography>
                    {csvFile && (
                      <Chip 
                        label={`${csvData.length} records loaded`}
                        color="success"
                        sx={{ mt: 2 }}
                      />
                    )}
                  </Box>
                </label>
              </Paper>

              {csvData.length > 0 && (
                <Paper elevation={1} sx={{ p: 2, mb: 2, maxHeight: 400, overflow: 'auto' }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    Preview (First 5 rows)
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f8fafc' }}>
                          {Object.keys(csvData[0]).map(header => (
                            <TableCell key={header} sx={{ fontWeight: 600, fontSize: '12px' }}>
                              {header}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {csvData.slice(0, 5).map((row, index) => (
                          <TableRow key={index} hover>
                            {Object.values(row).map((value, idx) => (
                              <TableCell key={idx} sx={{ fontSize: '12px' }}>
                                {value === null || value === '' ? '-' : String(value)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              )}
            </Box>
          )}

          <Button
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
            onClick={handlePredict}
            disabled={
              loading || 
              (inputMethod === 'json' && !inputData) || 
              (inputMethod === 'csv' && csvData.length === 0)
            }
            sx={{ mt: 2 }}
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
