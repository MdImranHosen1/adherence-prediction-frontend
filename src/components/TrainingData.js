import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Dataset,
  NavigateBefore,
  NavigateNext,
  FirstPage,
  LastPage,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getTrainingData, getTrainingDataStats } from '../api';

const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b'];

function TrainingData() {
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = useCallback(async () => {
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
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading && !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">{error}</Typography>
      </Box>
    );
  }

  const totalPages = Math.ceil((data?.total_records || 0) / pageSize);

  // Prepare chart data
  const targetChartData = stats?.target_distribution ? [
    { name: 'Good Subject', value: stats.target_distribution['1'] || stats.target_distribution['Good Subject'] || 0 },
    { name: 'Bad Subject', value: stats.target_distribution['0'] || stats.target_distribution['Bad Subject'] || 0 }
  ] : [];

  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Dataset sx={{ fontSize: 32, mr: 1, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Training Data
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Browse and analyze the training dataset used for the adherence prediction model
        </Typography>
      </Box>

      {/* Statistics Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
                Total Records
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {stats?.total_records}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
                Features
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {stats?.features_count}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: 'white', height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
                Good Subjects
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {stats?.target_distribution?.['1'] || stats?.target_distribution?.['Good Subject'] || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)', color: 'white', height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>
                Bad Subjects
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {stats?.target_distribution?.['0'] || stats?.target_distribution?.['Bad Subject'] || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Target Distribution Chart */}
      {targetChartData.length > 0 && (
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Target Distribution
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <PieChart width={400} height={300}>
                <Pie
                  data={targetChartData}
                  cx={200}
                  cy={150}
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {targetChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Categorical Distribution */}
      {stats?.categorical_distribution && (
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Categorical Feature Distribution
            </Typography>
            <Grid container spacing={3}>
              {Object.entries(stats.categorical_distribution).slice(0, 3).map(([feature, distribution]) => {
                const chartData = Object.entries(distribution).map(([value, count]) => ({
                  name: value,
                  count: count
                }));
                return (
                  <Grid item xs={12} md={4} key={feature}>
                    <Paper elevation={1} sx={{ p: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                        {feature}
                      </Typography>
                      <BarChart width={250} height={200} data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" style={{ fontSize: '12px' }} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Numerical Statistics */}
      {stats?.numerical_statistics && (
        <Card elevation={2} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Numerical Feature Statistics
            </Typography>
            <Paper elevation={1} sx={{ overflow: 'hidden' }}>
              <Box sx={{ overflowX: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Feature</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Mean</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Median</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Min</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Max</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Std Dev</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(stats.numerical_statistics).map(([feature, stat]) => (
                      <TableRow key={feature} hover>
                        <TableCell>
                          <code style={{ 
                            backgroundColor: '#f1f5f9', 
                            padding: '2px 6px', 
                            borderRadius: '4px',
                            fontSize: '13px'
                          }}>
                            {feature}
                          </code>
                        </TableCell>
                        <TableCell>{stat.mean?.toFixed(2)}</TableCell>
                        <TableCell>{stat.median}</TableCell>
                        <TableCell>{stat.min}</TableCell>
                        <TableCell>{stat.max}</TableCell>
                        <TableCell>{stat.std_dev?.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Paper>
          </CardContent>
        </Card>
      )}

      {/* Training Data Records */}
      <Card elevation={2}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Training Records
            </Typography>
          </Box>
          <Paper elevation={1} sx={{ overflow: 'hidden' }}>
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Performance ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Age Category</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Positive Lymph Nodes</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Bilateral Renal Function</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Stratum Group</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Race ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Ethnic ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Histologic Grade</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Cardiac Condition</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Target</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.data?.map((record, index) => (
                    <TableRow 
                      key={index} 
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
                          {record.PERFORMANCE_ID}
                        </code>
                      </TableCell>
                      <TableCell>{record.agecat}</TableCell>
                      <TableCell>{record.num_pos_lymph_node}</TableCell>
                      <TableCell>{record.bilateral_renal_function}</TableCell>
                      <TableCell>{record.STRATUM_GRP_ID}</TableCell>
                      <TableCell>{record.RACE_ID}</TableCell>
                      <TableCell>{record.ETHNIC_ID}</TableCell>
                      <TableCell>{record.Histologic_grade}</TableCell>
                      <TableCell>{record.No_cardiact_condition}</TableCell>
                      <TableCell>
                        <Chip
                          label={record.offtrt_reason === 1 ? 'Complete' : 'Incomplete'}
                          color={record.offtrt_reason === 1 ? 'success' : 'error'}
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Paper>
          
          {/* Enhanced Pagination Controls */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Rows per page</InputLabel>
                <Select
                  value={pageSize}
                  label="Rows per page"
                  onChange={(e) => {
                    setPageSize(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" color="text.secondary">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, data?.total_records || 0)} of {data?.total_records || 0} records
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FirstPage />}
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                First
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<NavigateBefore />}
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Prev
              </Button>
              
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Page</InputLabel>
                <Select
                  value={currentPage}
                  label="Page"
                  onChange={(e) => setCurrentPage(e.target.value)}
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <MenuItem key={page} value={page}>
                      {page}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Typography variant="body2" color="text.secondary">
                of {totalPages}
              </Typography>
              
              <Button
                variant="outlined"
                size="small"
                endIcon={<NavigateNext />}
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
              <Button
                variant="outlined"
                size="small"
                endIcon={<LastPage />}
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Last
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default TrainingData;
