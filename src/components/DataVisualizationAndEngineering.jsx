// src/components/DataVisualizationAndEngineering.jsx
import React, { useEffect, useState, useContext } from "react";
import Plot from "react-plotly.js";
import { AppContext } from "../context/AppContext";
import {
  Box,
  Grid,
  Paper,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

const BACKEND_URL = "https://manufacturing-copilot-backend.onrender.com";

export default function DataVisualizationAndEngineering() {
  const { uploadedFile } = useContext(AppContext);
  const theme = useTheme();
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [plotData, setPlotData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch columns from backend
  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/get_columns`, {
          method: "GET",
        });
        if (!response.ok) throw new Error("Failed to fetch columns");

        const data = await response.json();
        if (data.columns) {
          setColumns(data.columns);
        } else {
          setError(data.error || "No columns found.");
        }
      } catch (err) {
        console.error(err);
        setError("Error fetching columns.");
      }
    };

    fetchColumns();
  }, []);

  // Handle checkbox toggle
  const handleCheckboxChange = (column) => {
    setSelectedColumns((prev) =>
      prev.includes(column)
        ? prev.filter((c) => c !== column)
        : [...prev, column]
    );
  };

  // Run variability analysis
  const runAnalysis = async () => {
    if (selectedColumns.length === 0) {
      setError("Please select at least one column for analysis.");
      return;
    }

    setError("");
    setLoading(true);
    setPlotData(null);

    try {
      // Only run for the first selected column for now
      const prompt = `Perform variability analysis where selected variable is ${selectedColumns[0]}`;
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const result = await response.json();

      if (result.type === "plot" && result.data) {
        setPlotData(result.data);
      } else {
        setError("Unexpected response from server.");
      }
    } catch (err) {
      console.error(err);
      setError("Error running variability analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
  <Grid
    container
    spacing={2}
    sx={{
      height: "calc(100vh - 100px)",
      flexWrap: "nowrap", // ✅ Prevent wrapping on desktop
    }}
  >
    {/* LEFT PANEL - Controls */}
    <Grid
      item
      xs={12}
      md={3}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Paper
        sx={{
          p: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          bgcolor: theme.palette.background.paper,
        }}
        elevation={3}
      >
        
        <Typography variant="subtitle1" gutterBottom>
          Variability Analysis
        </Typography>

        <Box sx={{ flexGrow: 1, overflowY: "auto", pr: 1 }}>
          <FormGroup>
            {columns.map((col) => (
              <FormControlLabel
                key={col}
                control={
                  <Checkbox
                    checked={selectedColumns.includes(col)}
                    onChange={() => handleCheckboxChange(col)}
                  />
                }
                label={col}
              />
            ))}
          </FormGroup>
        </Box>

        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={runAnalysis}
        >
          Run Analysis
        </Button>
      </Paper>
    </Grid>

    {/* RIGHT PANEL - Output */}
    <Grid
      item
      xs={12}
      md={9}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Paper
        sx={{
          p: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          bgcolor: theme.palette.background.paper,
        }}
        elevation={3}
      >
        <Typography variant="h6" gutterBottom color="primary">
          Analysis Output
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ flexGrow: 1, overflowY: "auto", minHeight: 0 }}>
          {loading && <CircularProgress />}
          {error && <Alert severity="error">{error}</Alert>}
          {plotData ? (
            <Plot
              data={plotData.data}
              layout={{
                ...plotData.layout,
                autosize: true,
                paper_bgcolor: theme.palette.background.paper,
                plot_bgcolor: theme.palette.background.default,
              }}
              style={{ width: "100%", height: "100%" }}
              useResizeHandler
            />
          ) : (
            !loading &&
            !error && (
              <Typography variant="body2" color="text.secondary">
                No analysis results yet.
              </Typography>
            )
          )}
        </Box>
      </Paper>
    </Grid>
  </Grid>
);
}
