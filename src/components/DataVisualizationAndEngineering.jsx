// src/components/DataVisualizationAndEngineering.jsx
import React, { useState, useContext, useEffect } from "react";
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  RadioGroup,
  Radio,
  MenuItem,
  Select,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTheme } from "@mui/material/styles";

const BACKEND_URL = "https://manufacturing-copilot-backend.onrender.com";

export default function DataVisualizationAndEngineering() {
  const { uploadedFile } = useContext(AppContext);
  const theme = useTheme();

  const [expanded, setExpanded] = useState("variability");
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [plotData, setPlotData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // State for other functionalities
  const [missingValueColumn, setMissingValueColumn] = useState("");
  const [treatmentMode, setTreatmentMode] = useState("datetime");
  const [outlierMethod, setOutlierMethod] = useState("zscore");
  const [treatmentMethod, setTreatmentMethod] = useState("mean");

  // Fetch columns from backend
  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/get_columns`);
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

  // Handle left panel expansion
  const handleExpand = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Handle checkbox toggle
  const handleCheckboxChange = (column) => {
    setSelectedColumns((prev) =>
      prev.includes(column) ? prev.filter((c) => c !== column) : [...prev, column]
    );
  };

  // Run Variability Analysis
  const runVariabilityAnalysis = async () => {
    if (selectedColumns.length === 0) {
      setError("Please select at least one column for analysis.");
      return;
    }

    setError("");
    setLoading(true);
    setPlotData(null);

    try {
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

  // Placeholder handlers for other functions (can plug in full logic)
  const runMissingValueAnalysis = () => {
    console.log("Missing Value Analysis triggered for", missingValueColumn);
  };

  const applyMissingValueTreatment = () => {
    console.log(`Applying ${treatmentMethod} treatment in mode: ${treatmentMode}`);
  };

  const runOutlierAnalysis = () => {
    console.log(`Outlier Analysis with method: ${outlierMethod}`);
  };

  const applyOutlierTreatment = () => {
    console.log(`Applying Outlier Treatment: ${treatmentMethod}`);
  };

  return (
    <Grid container spacing={2} sx={{ height: "calc(100vh - 100px)", flexWrap: "nowrap" }}>
      {/* LEFT PANEL */}
      <Grid
        item
        xs={12}
        md={3}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto", // ✅ scrollbar inside left panel
        }}
      >
        <Paper
          sx={{
            p: 1,
            bgcolor: theme.palette.background.paper,
            flexGrow: 1,
          }}
          elevation={3}
        >
          {/* Variability Analysis */}
          <Accordion expanded={expanded === "variability"} onChange={handleExpand("variability")}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Variability Analysis</Typography>
            </AccordionSummary>
            <AccordionDetails>
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
              <Button variant="contained" sx={{ mt: 1 }} onClick={runVariabilityAnalysis}>
                Run Analysis
              </Button>
            </AccordionDetails>
          </Accordion>

          {/* Missing Value Analysis */}
          <Accordion expanded={expanded === "missingAnalysis"} onChange={handleExpand("missingAnalysis")}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Missing Value Analysis</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <RadioGroup value={missingValueColumn} onChange={(e) => setMissingValueColumn(e.target.value)}>
                {columns.map((col) => (
                  <FormControlLabel key={col} value={col} control={<Radio />} label={col} />
                ))}
              </RadioGroup>
              <Button variant="contained" sx={{ mt: 1 }} onClick={runMissingValueAnalysis}>
                Run Analysis
              </Button>
            </AccordionDetails>
          </Accordion>

          {/* Missing Value Treatment */}
          <Accordion expanded={expanded === "missingTreatment"} onChange={handleExpand("missingTreatment")}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Missing Value Treatment</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <RadioGroup value={treatmentMode} onChange={(e) => setTreatmentMode(e.target.value)}>
                <FormControlLabel value="datetime" control={<Radio />} label="Missing Date Times" />
                <FormControlLabel value="column" control={<Radio />} label="Missing Values in Column" />
              </RadioGroup>
              <Select value={treatmentMethod} onChange={(e) => setTreatmentMethod(e.target.value)} fullWidth sx={{ mt: 1 }}>
                <MenuItem value="mean">Mean</MenuItem>
                <MenuItem value="median">Median</MenuItem>
                <MenuItem value="ffill">Forward Fill</MenuItem>
                <MenuItem value="bfill">Backward Fill</MenuItem>
              </Select>
              <Button variant="contained" sx={{ mt: 1 }} onClick={applyMissingValueTreatment}>
                Apply Treatment
              </Button>
            </AccordionDetails>
          </Accordion>

          {/* Outlier Analysis */}
          <Accordion expanded={expanded === "outlierAnalysis"} onChange={handleExpand("outlierAnalysis")}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Outlier Analysis</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <RadioGroup value={outlierMethod} onChange={(e) => setOutlierMethod(e.target.value)}>
                <FormControlLabel value="zscore" control={<Radio />} label="Z-Score" />
                <FormControlLabel value="iqr" control={<Radio />} label="IQR" />
              </RadioGroup>
              <Button variant="contained" sx={{ mt: 1 }} onClick={runOutlierAnalysis}>
                Run Analysis
              </Button>
            </AccordionDetails>
          </Accordion>

          {/* Outlier Treatment */}
          <Accordion expanded={expanded === "outlierTreatment"} onChange={handleExpand("outlierTreatment")}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Outlier Treatment</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Select value={treatmentMethod} onChange={(e) => setTreatmentMethod(e.target.value)} fullWidth>
                <MenuItem value="mean">Mean</MenuItem>
                <MenuItem value="median">Median</MenuItem>
                <MenuItem value="ffill">Forward Fill</MenuItem>
                <MenuItem value="bfill">Backward Fill</MenuItem>
              </Select>
              <Button variant="contained" sx={{ mt: 1 }} onClick={applyOutlierTreatment}>
                Apply Treatment
              </Button>
            </AccordionDetails>
          </Accordion>
        </Paper>
      </Grid>

      {/* RIGHT PANEL */}
      <Grid item xs={12} md={9} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
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
