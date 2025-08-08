// src/pages/DataVisualizationAndEngineering.jsx

import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  FormControlLabel,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import Plot from "react-plotly.js";
import { AppContext } from "../context/AppContext";

const BACKEND_URL = "https://manufacturing-copilot-backend.onrender.com";

const DataVisualizationAndEngineering = () => {
  const { uploadedFile } = useContext(AppContext);
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [loadingColumns, setLoadingColumns] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [plotData, setPlotData] = useState(null);
  const [error, setError] = useState("");

  // Fetch columns on mount
  useEffect(() => {
    if (!uploadedFile) {
      setError("No file uploaded. Please upload a file on the Home page first.");
      return;
    }

    const fetchColumns = async () => {
      setLoadingColumns(true);
      setError("");
      try {
        const response = await fetch(`${BACKEND_URL}/get_columns`, {
          method: "GET",
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        if (data.columns) {
          setColumns(data.columns);
        } else {
          throw new Error("No columns found in response.");
        }
      } catch (err) {
        console.error("Error fetching columns:", err);
        setError("Failed to fetch columns from backend.");
      } finally {
        setLoadingColumns(false);
      }
    };

    fetchColumns();
  }, [uploadedFile]);

  // Run variability analysis
  const handleRunAnalysis = async () => {
    if (!selectedColumn) return;
    setLoadingAnalysis(true);
    setError("");
    setPlotData(null);

    try {
      const prompt = `Perform variability analysis where selected variable is ${selectedColumn}`;
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      console.log("Chat response:", data);

      if (data.type === "plot" && data.data) {
        setPlotData(data.data);
      } else {
        setError("Unexpected response format from backend.");
      }
    } catch (err) {
      console.error("Error running analysis:", err);
      setError("Failed to run variability analysis.");
    } finally {
      setLoadingAnalysis(false);
    }
  };

  return (
    <Box p={3}>
      {/* Variability Analysis Card */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Variability Analysis" />
        <CardContent>
          {loadingColumns ? (
            <CircularProgress size={24} />
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <>
              {columns.map((col) => (
                <FormControlLabel
                  key={col}
                  control={
                    <Checkbox
                      checked={selectedColumn === col}
                      onChange={() => setSelectedColumn(col)}
                    />
                  }
                  label={col}
                />
              ))}
              <Box mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleRunAnalysis}
                  disabled={!selectedColumn || loadingAnalysis}
                >
                  {loadingAnalysis ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "Run Analysis"
                  )}
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Plotly Chart */}
      {plotData && (
        <Card>
          <CardHeader title="Analysis Result" />
          <CardContent>
            <Plot
              data={plotData.data}
              layout={plotData.layout}
              config={{ responsive: true }}
              style={{ width: "100%", height: "100%" }}
            />
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default DataVisualizationAndEngineering;
