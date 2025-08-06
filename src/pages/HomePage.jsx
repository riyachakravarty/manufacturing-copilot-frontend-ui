// src/pages/HomePage.jsx

import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  MenuItem,
  Select,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

const HomePage = ({ setUploadedFile, setSelectedMode }) => {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setFileName(e.target.files[0]?.name || '');
  };

  const handleModeChange = (e) => {
    setMode(e.target.value);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);

    try {
      const response = await fetch('https://manufacturing-copilot-backend.onrender.com/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadedFile(file);
        setSelectedMode(mode);
        setShowSnackbar(true);
      } else {
        alert('File upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload error');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExploring = () => {
    if (file && mode) {
      navigate('/main');
    } else {
      alert('Please upload a file and select a mode first.');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Card elevation={6}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Welcome to the Manufacturing Co-Pilot
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Upload your dataset and choose how you'd like to interact with the platform.
          </Typography>

          <Box sx={{ my: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={8}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadFileIcon />}
                  fullWidth
                >
                  Select File
                  <input type="file" hidden onChange={handleFileChange} />
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpload}
                  disabled={!file || loading}
                  startIcon={<UploadFileIcon />}
                  fullWidth
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'Upload'}
                </Button>
              </Grid>

              {fileName && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="success.main">
                    File "{fileName}" has been uploaded successfully.
                  </Typography>
                </Grid>
              )}

              <Grid item xs={12}>
                <Typography variant="h6">Select Mode</Typography>
                <Select
                  fullWidth
                  value={mode}
                  onChange={handleModeChange}
                  displayEmpty
                  startAdornment={<SettingsSuggestIcon sx={{ mr: 1 }} />}
                >
                  <MenuItem value="" disabled>
                    Choose mode
                  </MenuItem>
                  <MenuItem value="button">Click of a Button</MenuItem>
                  <MenuItem value="genai">Gen-AI Led Prompt</MenuItem>
                </Select>
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  startIcon={<RocketLaunchIcon />}
                  onClick={handleStartExploring}
                  fullWidth
                >
                  Start Exploring
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
      >
        <Alert severity="success" onClose={() => setShowSnackbar(false)}>
          File uploaded successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default HomePage;
