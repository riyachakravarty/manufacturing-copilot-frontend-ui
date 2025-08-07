import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import Plot from "react-plotly.js";
import { AppContext } from "../context/AppContext";

const BACKEND_URL = "https://manufacturing-copilot-backend.onrender.com";

const DataVisualizationAndEngineering = () => {
  const { uploadedFile } = useContext(AppContext);
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [plotData, setPlotData] = useState(null);
  const [plotLayout, setPlotLayout] = useState(null);
  const [error, setError] = useState("");

  // Fetch columns once file is available
  useEffect(() => {
    if (uploadedFile) {
      fetch(`${BACKEND_URL}/get_columns`, {
        method: "GET",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.columns) {
            setColumns(data.columns);
          } else {
            setError("Failed to fetch columns");
          }
        })
        .catch(() => setError("Error fetching columns"));
    }
  }, [uploadedFile]);

  const handleColumnChange = (event) => {
    const column = event.target.name;
    setSelectedColumns((prev) =>
      event.target.checked
        ? [...prev, column]
        : prev.filter((col) => col !== column)
    );
  };

  const handleRunVariabilityAnalysis = async () => {
    setLoading(true);
    setError("");
    setPlotData(null);
    setPlotLayout(null);

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);

      const prompt = `Perform variability analysis where selected variable is ${selectedColumns.join(", ")}`;

      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.type === "plot" && result.data) {
        const { data, layout } = result.data;
        setPlotData(data);
        setPlotLayout(layout);
      } else {
        setError("Unexpected response from server");
      }
    } catch (err) {
      setError("Failed to perform variability analysis");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Variability Analysis
          </Typography>

          {columns.length === 0 ? (
            <Typography>Loading columns...</Typography>
          ) : (
            <FormGroup row>
              {columns.map((column) => (
                <FormControlLabel
                  key={column}
                  control={
                    <Checkbox
                      checked={selectedColumns.includes(column)}
                      onChange={handleColumnChange}
                      name={column}
                    />
                  }
                  label={column}
                />
              ))}
            </FormGroup>
          )}

          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleRunVariabilityAnalysis}
            disabled={loading || selectedColumns.length === 0}
          >
            {loading ? <CircularProgress size={24} /> : "Run Variability Analysis"}
          </Button>

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </CardContent>
      </Card>

      {plotData && plotLayout && (
        <Card>
          <CardContent>
            <Typography variant="h6">Analysis Result</Typography>
            <Plot data={plotData} layout={plotLayout} style={{ width: "100%" }} />
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default DataVisualizationAndEngineering;
