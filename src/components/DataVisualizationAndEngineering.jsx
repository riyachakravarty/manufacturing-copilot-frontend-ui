// src/components/DataVisualizationAndEngineering.jsx
import React, { useEffect, useState, useContext } from "react";
import Plot from "react-plotly.js";
import { AppContext } from "../context/AppContext";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";

const BACKEND_URL = "https://manufacturing-copilot-backend.onrender.com";

const DataVisualizationAndEngineering = () => {
  const { uploadedFile } = useContext(AppContext);
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
  const handleColumnToggle = (column) => {
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
      // Only run for the first selected column for now (as per original code)
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
    <Box sx={{ flexGrow: 1, height: "calc(100vh - 64px)", p: 2 }}>
      <Grid container spacing={2} sx={{ height: "100%" }}>
        {/* Left Panel */}
        <Grid
          item
          xs={12}
          md={3}
          sx={{
            height: "100%",
            overflowY: "auto",
          }}
        >
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Data Visualization & Engineering
              </Typography>

              {uploadedFile && uploadedFile.name && (
                <Typography variant="body2" color="text.secondary">
                  File: {uploadedFile.name}
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6">Variability Analysis</Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <FormGroup>
                {columns.length > 0 ? (
                  columns.map((col) => (
                    <FormControlLabel
                      key={col}
                      control={
                        <Checkbox
                          checked={selectedColumns.includes(col)}
                          onChange={() => handleColumnToggle(col)}
                        />
                      }
                      label={col}
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No columns available. Please upload a file first.
                  </Typography>
                )}
              </FormGroup>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={runAnalysis}
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : "Run Analysis"}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Panel */}
        <Grid
          item
          xs={12}
          md={9}
          sx={{
            height: "100%",
            overflowY: "auto",
          }}
        >
          <Card>
            <CardContent>
              {plotData ? (
                <Plot
                  data={plotData.data}
                  layout={plotData.layout}
                  config={{ responsive: true }}
                  style={{ width: "100%", height: "100%" }}
                />
              ) : (
                <Typography variant="body1" color="text.secondary">
                  Run an analysis to see results here.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DataVisualizationAndEngineering;
