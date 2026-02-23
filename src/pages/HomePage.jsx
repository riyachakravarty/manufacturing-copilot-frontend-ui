// src/pages/HomePage.jsx
import React, { useState } from "react";
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
  FormControl,
  InputLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from "@mui/material/styles";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { useContext } from "react";
import { AppContext } from "../context/AppContext";

const BACKEND_URL = "https://manufacturing-copilot-backend.onrender.com";

const HomePage = () => {
  const theme = useTheme();
  const { setUploadedFile, setSelectedMode, setContextFiles, targetColumn, setTargetColumn } = useContext(AppContext);
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const navigate = useNavigate();
  const [localContextFiles, setLocalContextFiles] = useState([]);
  const [contextUploading, setContextUploading] = useState(false);
  //const [targetColumn, setTargetColumn] = useState("");
  const [columns, setColumns] = useState([]);


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

            // Fetch columns AFTER upload
        const colResponse = await fetch(`${BACKEND_URL}/get_columns`);
        if (!colResponse.ok) throw new Error("Failed to fetch columns");
        const colData = await colResponse.json();
        if (colData.columns) {
          setColumns(colData.columns);
        }

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
    <Container maxWidth="md" sx={{ py: 6 }}>
  <Card
    elevation={4}
    sx={{
      borderRadius: 4,
      px: 4,
      py: 5,
    }}
  >
    <CardContent sx={{ p: 0 }}>

      {/* Header */}
      <Typography
        variant="h4"
        sx={{ fontWeight: 600, mb: 1 }}
      >
        Welcome to Nexus AI
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 4 }}
      >
        Upload your dataset, select your objective, and start optimizing.
      </Typography>

      <Grid container spacing={4}>

        {/* ---------------- FILE UPLOAD ---------------- */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Upload Dataset
          </Typography>

          <Grid container spacing={2}>
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
                onClick={handleUpload}
                disabled={!file || loading}
                fullWidth
              >
                {loading
                  ? <CircularProgress size={20} color="inherit" />
                  : "Upload"}
              </Button>
            </Grid>

            {fileName && (
              <Grid item xs={12}>
                <Typography variant="body2" color="success.main">
                  File "{fileName}" being processed.
                </Typography>
              </Grid>
            )}
          </Grid>
        </Grid>

        {/* ---------------- CONTEXT FILES ---------------- */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Add Process Context (Optional)
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <Button
                variant="outlined"
                component="label"
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
                disabled={localContextFiles.length === 0 || contextUploading}
                onClick={handleContextUpload}
                fullWidth
              >
                {contextUploading
                  ? <CircularProgress size={20} color="inherit" />
                  : "Upload Context"}
              </Button>
            </Grid>

            {localContextFiles.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="body2">
                  {localContextFiles.length} context file(s) added
                </Typography>
              </Grid>
            )}
          </Grid>
        </Grid>

        {/* ---------------- TARGET + MODE ---------------- */}
        <Grid item xs={12}>

          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Select Objective
          </Typography>

          <FormControl
            size="small"
            sx={{ width: { xs: "100%", sm: 350 }, mb: 3 }}
          >
            <InputLabel>Target Variable</InputLabel>
            <Select
              value={targetColumn}
              label="Target Variable"
              onChange={(e) => setTargetColumn(e.target.value)}
            >
              {columns.map((col) => (
                <MenuItem key={col} value={col}>
                  {col}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Select Mode
          </Typography>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Select
                fullWidth
                size="small"
                value={mode}
                onChange={handleModeChange}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Choose mode
                </MenuItem>
                <MenuItem value="button">Click of a Button</MenuItem>
                <MenuItem value="genai">Gen-AI Led Prompt</MenuItem>
              </Select>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<RocketLaunchIcon />}
                onClick={handleStartExploring}
                disabled={!uploadedFile || !mode || !targetColumn}
                fullWidth
                sx={{ fontWeight: 600 }}
              >
                Start Exploring
              </Button>
            </Grid>
          </Grid>
        </Grid>

      </Grid>
    </CardContent>
  </Card>

  {/* Snackbar */}
  <Snackbar
    open={showSnackbar}
    autoHideDuration={3000}
    onClose={() => setShowSnackbar(false)}
  >
    <Alert
      severity="success"
      onClose={() => setShowSnackbar(false)}
      variant="filled"
    >
      File uploaded successfully!
    </Alert>
  </Snackbar>
</Container>

  );
};

export default HomePage;
