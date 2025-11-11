import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Storage,
  CheckCircle,
  Error as ErrorIcon,
  ContentPaste,
  PlayArrow,
} from '@mui/icons-material';
import { getFeatures, validateData, preprocessData } from '../api';

function DataManagement() {
  const [features, setFeatures] = useState(null);
  const [inputData, setInputData] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [preprocessResult, setPreprocessResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const data = await getFeatures();
        setFeatures(data);
      } catch (err) {
        setError('Failed to load features');
        console.error(err);
      }
    };

    fetchFeatures();
  }, []);

  const handleValidate = async () => {
    try {
      setLoading(true);
      setError(null);
      const parsedData = JSON.parse(inputData);
      const result = await validateData(parsedData);
      setValidationResult(result);
    } catch (err) {
      setError('Invalid JSON format or validation failed');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreprocess = async () => {
    try {
      setLoading(true);
      setError(null);
      const parsedData = JSON.parse(inputData);
      const result = await preprocessData(parsedData);
      setPreprocessResult(result);
    } catch (err) {
      setError('Invalid JSON format or preprocessing failed');
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
    num_lymph_node_examined: 7,
    num_pos_lymph_node: 0
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Storage sx={{ fontSize: 32, mr: 1, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Data Management
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Validate and preprocess input data before making predictions
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Features Information */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Model Features
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1">
              <strong>Total Features:</strong> {features?.total_features} 
              <Chip 
                label={`${features?.categorical_features} categorical`} 
                size="small" 
                color="primary" 
                sx={{ ml: 1, mr: 1 }}
              />
              <Chip 
                label={`${features?.numerical_features} numerical`} 
                size="small" 
                color="secondary" 
                sx={{ ml: 1 }}
              />
            </Typography>
          </Box>
          <Paper elevation={1} sx={{ overflow: 'hidden' }}>
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Feature Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Required</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Constraints</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {features?.features?.slice(0, 10).map((feature) => (
                    <TableRow key={feature.name} hover>
                      <TableCell>
                        <code style={{ 
                          backgroundColor: '#f1f5f9', 
                          padding: '2px 6px', 
                          borderRadius: '4px',
                          fontSize: '13px'
                        }}>
                          {feature.name}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={feature.type} 
                          size="small" 
                          color={feature.type === 'categorical' ? 'primary' : 'secondary'}
                        />
                      </TableCell>
                      <TableCell>{feature.description}</TableCell>
                      <TableCell>
                        {feature.required ? (
                          <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                        ) : (
                          <ErrorIcon sx={{ color: 'error.main', fontSize: 20 }} />
                        )}
                      </TableCell>
                      <TableCell>
                        {feature.allowed_values 
                          ? `Values: ${feature.allowed_values.join(', ')}`
                          : feature.min_value !== undefined 
                          ? `Range: ${feature.min_value}-${feature.max_value}`
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Paper>
          {features?.features?.length > 10 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Showing first 10 of {features.features.length} features
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Data Input */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Input Data
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
            rows={12}
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

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
              onClick={handleValidate}
              disabled={loading || !inputData}
            >
              Validate Data
            </Button>
            <Button
              variant="contained"
              color="success"
              size="large"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
              onClick={handlePreprocess}
              disabled={loading || !inputData}
            >
              Preprocess Data
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Validation Result */}
      {validationResult && (
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Validation Result
            </Typography>
            {validationResult.is_valid ? (
              <Alert severity="success" icon={<CheckCircle />}>
                Data is valid and ready for prediction
              </Alert>
            ) : (
              <Alert severity="error" icon={<ErrorIcon />}>
                Data validation failed
              </Alert>
            )}
            {validationResult.missing_columns?.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Missing Columns:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {validationResult.missing_columns.map((col) => (
                    <Chip key={col} label={col} color="error" size="small" />
                  ))}
                </Box>
              </Box>
            )}
            {validationResult.message && (
              <Typography variant="body2" sx={{ mt: 2 }}>
                {validationResult.message}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preprocessing Result */}
      {preprocessResult && (
        <Card elevation={2}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Preprocessing Result
            </Typography>
            <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 2 }}>
              Data preprocessed successfully
            </Alert>
            <Paper elevation={1} sx={{ 
              p: 2, 
              backgroundColor: '#f8fafc',
              overflow: 'auto',
              maxHeight: '400px'
            }}>
              <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '13px' }}>
                {JSON.stringify(preprocessResult.preprocessed_data, null, 2)}
              </pre>
            </Paper>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default DataManagement;
