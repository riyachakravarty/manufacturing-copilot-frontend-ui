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
import { useContext } from "react";
import { AppContext } from "../context/AppContext";

const HomePage = () => {
  const { setUploadedFile, setSelectedMode, setContextFiles } = useContext(AppContext);
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const navigate = useNavigate();
  const [localContextFiles, setLocalContextFiles] = useState([]);
  const [contextUploading, setContextUploading] = useState(false);

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
        alert('File upload successful!')
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

  const handleContextFilesChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setLocalContextFiles((prev) => [...prev, ...newFiles]);
  };

  const handleContextUpload = async () => {
    if (localContextFiles.length === 0) return;
  
    const formData = new FormData();
    localContextFiles.forEach((file) => {
      formData.append("files", file);
    });
  
    setContextUploading(true);
  
    try {
      const response = await fetch(
        "https://manufacturing-copilot-backend.onrender.com/upload-context",
        {
          method: "POST",
          body: formData,
        }
      );
  
      if (!response.ok) {
        throw new Error("Context upload failed");
      }

      setContextFiles((prev) =>
        prev.concat(
          localContextFiles.map((f) => ({
            name: f.name,
            status: "uploaded",
          }))
        )
      );

      setLocalContextFiles([]);
  
      alert("Context files uploaded successfully");
    } catch (err) {
      console.error(err);
      alert("Error uploading context files");
    } finally {
      setContextUploading(false);
    }
  };
  
  

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Card elevation={6}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Welcome to Nexus AI
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
                    File "{fileName}" being processed.
                  </Typography>
                </Grid>
              )}

          <Grid item xs={12}>
            <Typography variant="h6">Add Process Context (Optional)</Typography>
          </Grid>

          <Grid item xs={12} sm={8}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              fullWidth
            >
              + Add Context Files
              <input
                type="file"
                hidden
                multiple
                onChange={handleContextFilesChange}
              />
            </Button>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleContextUpload}
              disabled={contextFiles.length === 0 || contextUploading}
              fullWidth
            >
              {contextUploading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Upload Context"
              )}
            </Button>
          </Grid>

          {contextFiles.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="body2">
                {contextFiles.length} context file(s) added
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
