// src/pages/DataVisualizationAndEngineering.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Checkbox,
  FormGroup,
  FormControlLabel,
} from "@mui/material";
import Plot from "react-plotly.js";
import { AppContext } from "../context/AppContext";

const BACKEND_URL = "https://manufacturing-copilot-backend.onrender.com";

export default function DataVisualizationAndEngineering() {
  const { uploadedFile } = useContext(AppContext);
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [loadingColumns, setLoadingColumns] = useState(false);
  const [loadingPlot, setLoadingPlot] = useState(false);
  const [plotData, setPlotData] = useState(null);

  // Fetch columns — if backend has lost state, re-upload from context
  const fetchColumns = async () => {
    setLoadingColumns(true);
    try {
      let res = await fetch(`${BACKEND_URL}/get_columns`);
      let data = await res.json();

      if (data.error && uploadedFile) {
        // Backend lost state — re-upload
        const formData = new FormData();
        formData.append("file", uploadedFile);
        const uploadRes = await fetch(`${BACKEND_URL}/upload`, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Re-upload failed");

        // Try fetching columns again
        res = await fetch(`${BACKEND_URL}/get_columns`);
        data = await res.json();
      }

      if (data.columns) {
        setColumns(data.columns);
      } else {
        console.error("No columns found:", data);
      }
    } catch (err) {
      console.error("Error fetching columns:", err);
    } finally {
      setLoadingColumns(false);
    }
  };

  useEffect(() => {
    fetchColumns();
  }, []);

  const handleRunAnalysis = async () => {
    if (!selectedColumn) return;
    setLoadingPlot(true);
    try {
      const payload = {
        prompt: `Perform variability analysis where selected variable is ${selectedColumn}`,
      };

      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.type === "plot" && data.data) {
        setPlotData(data.data);
      } else {
        console.error("Unexpected response:", data);
      }
    } catch (err) {
      console.error("Error running analysis:", err);
    } finally {
      setLoadingPlot(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Card sx={{ marginBottom: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Variability Analysis
          </Typography>

          {loadingColumns ? (
            <CircularProgress size={24} />
          ) : (
            <FormGroup>
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
            </FormGroup>
          )}

          <Button
            variant="contained"
            sx={{ mt: 2 }}
            disabled={!selectedColumn || loadingPlot}
            onClick={handleRunAnalysis}
          >
            {loadingPlot ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Run Analysis"
            )}
          </Button>
        </CardContent>
      </Card>

      {plotData && (
        <Card>
          <CardContent>
            <Typography variant="h6">Analysis Result</Typography>
            <Plot data={plotData.data} layout={plotData.layout} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
