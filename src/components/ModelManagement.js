import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
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
  CloudUpload,
  Refresh,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { getModels, deployModel } from '../api';

function ModelManagement() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deployResult, setDeployResult] = useState(null);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const data = await getModels();
      setModels(data.models || []);
      setError(null);
    } catch (err) {
      setError('Failed to load models');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async (modelId) => {
    try {
      setLoading(true);
      setDeployResult(null);
      const result = await deployModel(modelId);
      setDeployResult(result);
      // Refresh models list
      await fetchModels();
    } catch (err) {
      setError('Failed to deploy model');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && models.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <CloudUpload sx={{ fontSize: 32, mr: 1, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Model Management
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          View available model versions and deploy models for prediction
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      {deployResult && (
        <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 3 }}>
          <strong>{deployResult.message}</strong>
          <br />
          <Typography variant="body2">
            Previous: {deployResult.previous_model} → New: {deployResult.new_model}
            <br />
            Deployed at: {new Date(deployResult.deployment_time).toLocaleString()}
          </Typography>
        </Alert>
      )}

      {/* Models Table */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Available Models
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchModels}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
          <Paper elevation={1} sx={{ overflow: 'hidden' }}>
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Model ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Version</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Algorithm</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Training Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Accuracy</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {models.map((model) => (
                    <TableRow key={model.model_id} hover>
                      <TableCell>
                        <code style={{ 
                          backgroundColor: '#f1f5f9', 
                          padding: '2px 6px', 
                          borderRadius: '4px',
                          fontSize: '13px'
                        }}>
                          {model.model_id}
                        </code>
                      </TableCell>
                      <TableCell>{model.version}</TableCell>
                      <TableCell>{model.algorithm}</TableCell>
                      <TableCell>{model.training_date}</TableCell>
                      <TableCell>
                        <Chip 
                          label={`${(model.accuracy * 100).toFixed(1)}%`}
                          color="primary"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={model.status}
                          color={
                            model.status === 'deployed' ? 'success' :
                            model.status === 'testing' ? 'warning' : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {model.status !== 'deployed' ? (
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<CloudUpload />}
                            onClick={() => handleDeploy(model.model_id)}
                            disabled={loading}
                          >
                            Deploy
                          </Button>
                        ) : (
                          <Chip 
                            icon={<CheckCircle />}
                            label="Active"
                            color="success"
                            size="small"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Paper>
        </CardContent>
      </Card>

      {/* Model Details Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {models.map((model) => (
          <Grid item xs={12} md={4} key={model.model_id}>
            <Card elevation={2} sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {model.version}
                  </Typography>
                  <Chip
                    label={model.status}
                    color={
                      model.status === 'deployed' ? 'success' :
                      model.status === 'testing' ? 'warning' : 'default'
                    }
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Model ID:</strong> {model.model_id}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Algorithm:</strong> {model.algorithm}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Training Date:</strong> {model.training_date}
                </Typography>
                <Card sx={{ mt: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {(model.accuracy * 100).toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Accuracy
                    </Typography>
                  </CardContent>
                </Card>
                {model.status !== 'deployed' && (
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<CloudUpload />}
                    onClick={() => handleDeploy(model.model_id)}
                    disabled={loading}
                    sx={{ mt: 2 }}
                  >
                    Deploy This Model
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Model Information */}
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            About Model Deployment
          </Typography>
          <Paper elevation={1} sx={{ p: 2, backgroundColor: '#f8fafc' }}>
            <Typography variant="body2" sx={{ lineHeight: 1.8, color: '#475569', mb: 2 }}>
              Deploying a model will make it the active model used for all prediction requests. 
              The currently deployed model is marked with an "Active" status. Only one model can be 
              deployed at a time. Before deploying a new model, ensure it has been properly tested 
              and validated.
            </Typography>
          </Paper>
          <Alert severity="warning" icon={<Warning />} sx={{ mt: 2 }}>
            <strong>Note:</strong> Deploying a new model will immediately affect all prediction 
            endpoints. Make sure to review the model's performance metrics before deployment.
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ModelManagement;
