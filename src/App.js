import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { 
  CssBaseline, 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Typography,
  Divider,
  Avatar,
  Chip,
  Paper,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Storage,
  Psychology,
  Lightbulb,
  Dataset,
  CloudUpload,
  Timeline,
  LocalHospital,
} from '@mui/icons-material';
import './App.css';

// Import components
import Dashboard from './components/Dashboard';
import DataManagement from './components/DataManagement';
import Prediction from './components/Prediction';
import Explainability from './components/Explainability';
import TrainingData from './components/TrainingData';
import ModelManagement from './components/ModelManagement';
import History from './components/History';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3b82f6',
    },
    secondary: {
      main: '#8b5cf6',
    },
    success: {
      main: '#10b981',
    },
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#f59e0b',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/data-management" element={<DataManagement />} />
              <Route path="/prediction" element={<Prediction />} />
              <Route path="/explainability" element={<Explainability />} />
              <Route path="/training-data" element={<TrainingData />} />
              <Route path="/model-management" element={<ModelManagement />} />
              <Route path="/history" element={<History />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/data-management', label: 'Data Management', icon: <Storage /> },
    { path: '/prediction', label: 'Prediction', icon: <Psychology /> },
    { path: '/explainability', label: 'Explainability', icon: <Lightbulb /> },
    { path: '/training-data', label: 'Training Data', icon: <Dataset /> },
    { path: '/model-management', label: 'Model Management', icon: <CloudUpload /> },
    { path: '/history', label: 'History', icon: <Timeline /> }
  ];

  const drawerWidth = 280;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)',
          color: 'white',
          borderRight: 'none',
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Paper
          elevation={3}
          sx={{
            p: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 3,
            mb: 2,
          }}
        >
          <Avatar
            sx={{
              width: 60,
              height: 60,
              margin: '0 auto',
              mb: 1,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              fontSize: '32px',
            }}
          >
            <LocalHospital sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'white' }}>
            Adherence Predict
          </Typography>
          <Chip
            label="v1.2.0"
            size="small"
            sx={{
              mt: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontWeight: 600,
            }}
          />
        </Paper>
      </Box>

      <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', mx: 2 }} />

      {/* Navigation Menu */}
      <List sx={{ px: 2, py: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  backdropFilter: isActive ? 'blur(10px)' : 'none',
                  border: isActive ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'translateX(5px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  },
                  py: 1.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? '#fbbf24' : 'rgba(255, 255, 255, 0.7)',
                    minWidth: 40,
                    transition: 'all 0.3s ease',
                    '& svg': {
                      fontSize: 24,
                    },
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    sx: {
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '14px',
                      color: isActive ? 'white' : 'rgba(255, 255, 255, 0.85)',
                    },
                  }}
                />
                {isActive && (
                  <Box
                    sx={{
                      width: 4,
                      height: 24,
                      borderRadius: 2,
                      background: 'linear-gradient(180deg, #fbbf24 0%, #f59e0b 100%)',
                      boxShadow: '0 0 10px #fbbf24',
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer */}
      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', mx: 2, mb: 2 }} />
      <Box sx={{ p: 3 }}>
        <Paper
          elevation={2}
          sx={{
            p: 2,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block', mb: 0.5 }}>
            🤖 AI-Powered Analytics
          </Typography>
          <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
            Treatment Adherence
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block', mt: 1 }}>
            © 2025 MedPredict AI
          </Typography>
        </Paper>
      </Box>
    </Drawer>
  );
}

export default App;
