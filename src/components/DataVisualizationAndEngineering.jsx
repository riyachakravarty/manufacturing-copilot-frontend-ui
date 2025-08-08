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

  // Other UI states
  const [missingValueColumn, setMissingValueColumn] = useState("");
  const [treatmentMode, setTreatmentMode] = useState("datetime");

  // For treatment cards
  const [treatmentMethod, setTreatmentMethod] = useState("mean");

  // Mock intervals for demonstration
  const mockIntervals = [
    "2025-08-01 10:00 to 2025-08-01 12:00",
    "2025-08-02 14:00 to 2025-08-02 16:30",
    "2025-08-03 09:15 to 2025-08-03 10:45",
    "2025-08-04 11:00 to 2025-08-04 13:00",
    "2025-08-05 15:30 to 2025-08-05 17:00",
    "2025-08-06 08:00 to 2025-08-06 09:30",
  ];

  // Selected items for treatment cards
  const [treatmentSelectedColumns, setTreatmentSelectedColumns] = useState([]);
  const [treatmentSelectedIntervals, setTreatmentSelectedIntervals] = useState([]);

  // Outlier treatment states
  const [outlierMethod, setOutlierMethod] = useState("zscore");
  const [outlierSelectedColumns, setOutlierSelectedColumns] = useState([]);
  const [outlierSelectedIntervals, setOutlierSelectedIntervals] = useState([]);
  const [outlierTreatmentMethod, setOutlierTreatmentMethod] = useState("mean");

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

  const handleExpand = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
    setError("");
    setPlotData(null);
  };

  // Variability Analysis handlers
  const handleCheckboxChange = (column) => {
    setSelectedColumns((prev) =>
      prev.includes(column) ? prev.filter((c) => c !== column) : [...prev, column]
    );
  };

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

  // Missing Value Analysis handlers
  const runMissingValueAnalysis = async () => {
  if (!missingValueColumn) {
    setError("Please select a column for missing value analysis.");
    return;
  }
  setError("");
  setLoading(true);
  setPlotData(null);
  try {
    const prompt = `Perform missing value analysis where selected variable is ${missingValueColumn}`;
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
    setError("Error running missing value analysis.");
  } finally {
    setLoading(false);
  }
};


  // Treatment cards handlers
  const handleTreatmentColumnToggle = (col) => {
    setTreatmentSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const handleTreatmentIntervalToggle = (interval) => {
    setTreatmentSelectedIntervals((prev) =>
      prev.includes(interval) ? prev.filter((i) => i !== interval) : [...prev, interval]
    );
  };

  const handleOutlierColumnToggle = (col) => {
    setOutlierSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const handleOutlierIntervalToggle = (interval) => {
    setOutlierSelectedIntervals((prev) =>
      prev.includes(interval) ? prev.filter((i) => i !== interval) : [...prev, interval]
    );
  };

  // Placeholder apply treatment function
  const applyMissingValueTreatment = () => {
    console.log("Apply Missing Value Treatment:", {
      mode: treatmentMode,
      columns: treatmentSelectedColumns,
      intervals: treatmentSelectedIntervals,
      method: treatmentMethod,
    });
  };

  const applyOutlierTreatment = () => {
    console.log("Apply Outlier Treatment:", {
      columns: outlierSelectedColumns,
      intervals: outlierSelectedIntervals,
      method: outlierTreatmentMethod,
    });
  };

  return (
    <Grid container spacing={2} sx={{ height: "calc(100vh - 100px)", flexWrap: "nowrap" }}>
      {/* LEFT PANEL */}
      <Grid
        item
        xs={12}
        md={4} // widened panel
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          px: 1,
          fontSize: "0.85rem", // smaller font for entire panel
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
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                Variability Analysis
              </Typography>
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
                        size="small"
                      />
                    }
                    label={col}
                    sx={{ fontSize: "0.85rem" }}
                  />
                ))}
              </FormGroup>
              <Button variant="contained" size="small" sx={{ mt: 1 }} onClick={runVariabilityAnalysis}>
                Run Analysis
              </Button>
            </AccordionDetails>
          </Accordion>

          {/* Missing Value Analysis */}
<Accordion
  expanded={expanded === "missingAnalysis"}
  onChange={handleExpand("missingAnalysis")}
>
  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
      Missing Value Analysis
    </Typography>
  </AccordionSummary>
  <AccordionDetails
    sx={{
      maxWidth: 300,           // limit width so it doesn't stretch too wide
      overflowY: "auto",
      maxHeight: 300,
      pr: 1,
    }}
  >
    <RadioGroup
      value={missingValueColumn}
      onChange={(e) => setMissingValueColumn(e.target.value)}
      sx={{ maxWidth: '100%' }}
    >
      {columns.map((col) => (
        <FormControlLabel
          key={col}
          value={col}
          control={<Radio size="small" />}
          label={col}
          sx={{ fontSize: "0.85rem" }}
        />
      ))}
    </RadioGroup>
    <Button
      variant="contained"
      size="small"
      sx={{ mt: 1 }}
      onClick={runMissingValueAnalysis}
    >
      Run Analysis
    </Button>
  </AccordionDetails>
</Accordion>


          {/* Missing Value Treatment */}
          <Accordion
            expanded={expanded === "missingTreatment"}
            onChange={handleExpand("missingTreatment")}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                Missing Value Treatment
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <RadioGroup
                row
                value={treatmentMode}
                onChange={(e) => setTreatmentMode(e.target.value)}
                sx={{ mb: 1 }}
              >
                <FormControlLabel
                  value="datetime"
                  control={<Radio size="small" />}
                  label="Missing Date Times"
                  sx={{ fontSize: "0.85rem" }}
                />
                <FormControlLabel
                  value="column"
                  control={<Radio size="small" />}
                  label="Missing Values in Column"
                  sx={{ fontSize: "0.85rem" }}
                />
              </RadioGroup>

              <Grid container spacing={2}>
                {/* Column List */}
                <Grid
                  item
                  xs={4}
                  sx={{ maxHeight: 200, overflowY: "auto", borderRight: "1px solid #ccc", pr: 1 }}
                >
                  <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                    Columns
                  </Typography>
                  <FormGroup>
                    {columns.map((col) => (
                      <FormControlLabel
                        key={col}
                        control={
                          <Checkbox
                            size="small"
                            checked={treatmentSelectedColumns.includes(col)}
                            onChange={() => handleTreatmentColumnToggle(col)}
                          />
                        }
                        label={col}
                        sx={{ fontSize: "0.85rem" }}
                      />
                    ))}
                  </FormGroup>
                </Grid>

                {/* Interval List */}
                <Grid
                  item
                  xs={4}
                  sx={{
                    maxHeight: 200,
                    overflowY: "auto",
                    borderRight: "1px solid #ccc",
                    pl: 1,
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                    Intervals
                  </Typography>
                  <FormGroup>
                    {mockIntervals.map((interval) => (
                      <FormControlLabel
                        key={interval}
                        control={
                          <Checkbox
                            size="small"
                            checked={treatmentSelectedIntervals.includes(interval)}
                            onChange={() => handleTreatmentIntervalToggle(interval)}
                          />
                        }
                        label={interval}
                        sx={{ fontSize: "0.85rem" }}
                      />
                    ))}
                  </FormGroup>
                </Grid>

                {/* Treatment Method */}
                <Grid item xs={4}>
                  <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                    Treatment Method
                  </Typography>
                  <Select
                    size="small"
                    value={treatmentMethod}
                    onChange={(e) => setTreatmentMethod(e.target.value)}
                    fullWidth
                    sx={{ mt: 1 }}
                  >
                    <MenuItem value="mean">Mean</MenuItem>
                    <MenuItem value="median">Median</MenuItem>
                    <MenuItem value="ffill">Forward Fill</MenuItem>
                    <MenuItem value="bfill">Backward Fill</MenuItem>
                  </Select>

                  <Button
                    variant="contained"
                    size="small"
                    sx={{ mt: 2 }}
                    onClick={applyMissingValueTreatment}
                  >
                    Apply Treatment
                  </Button>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Outlier Analysis */}
          <Accordion expanded={expanded === "outlierAnalysis"} onChange={handleExpand("outlierAnalysis")}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                Outlier Analysis
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <RadioGroup
                value={outlierMethod}
                onChange={(e) => setOutlierMethod(e.target.value)}
                row
              >
                <FormControlLabel
                  value="zscore"
                  control={<Radio size="small" />}
                  label="Z-Score"
                  sx={{ fontSize: "0.85rem" }}
                />
                <FormControlLabel
                  value="iqr"
                  control={<Radio size="small" />}
                  label="IQR"
                  sx={{ fontSize: "0.85rem" }}
                />
              </RadioGroup>
              <Button
                variant="contained"
                size="small"
                sx={{ mt: 1 }}
                onClick={() => console.log("Run Outlier Analysis")}
              >
                Run Analysis
              </Button>
            </AccordionDetails>
          </Accordion>

          {/* Outlier Treatment */}
          <Accordion expanded={expanded === "outlierTreatment"} onChange={handleExpand("outlierTreatment")}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                Outlier Treatment
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {/* Column List */}
                <Grid
                  item
                  xs={4}
                  sx={{ maxHeight: 200, overflowY: "auto", borderRight: "1px solid #ccc", pr: 1 }}
                >
                  <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                    Columns
                  </Typography>
                  <FormGroup>
                    {columns.map((col) => (
                      <FormControlLabel
                        key={col}
                        control={
                          <Checkbox
                            size="small"
                            checked={outlierSelectedColumns.includes(col)}
                            onChange={() => handleOutlierColumnToggle(col)}
                          />
                        }
                        label={col}
                        sx={{ fontSize: "0.85rem" }}
                      />
                    ))}
                  </FormGroup>
                </Grid>

                {/* Interval List */}
                <Grid
                  item
                  xs={4}
                  sx={{
                    maxHeight: 200,
                    overflowY: "auto",
                    borderRight: "1px solid #ccc",
                    pl: 1,
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                    Intervals
                  </Typography>
                  <FormGroup>
                    {mockIntervals.map((interval) => (
                      <FormControlLabel
                        key={interval}
                        control={
                          <Checkbox
                            size="small"
                            checked={outlierSelectedIntervals.includes(interval)}
                            onChange={() => handleOutlierIntervalToggle(interval)}
                          />
                        }
                        label={interval}
                        sx={{ fontSize: "0.85rem" }}
                      />
                    ))}
                  </FormGroup>
                </Grid>

                {/* Treatment Method */}
                <Grid item xs={4}>
                  <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                    Treatment Method
                  </Typography>
                  <Select
                    size="small"
                    value={outlierTreatmentMethod}
                    onChange={(e) => setOutlierTreatmentMethod(e.target.value)}
                    fullWidth
                    sx={{ mt: 1 }}
                  >
                    <MenuItem value="mean">Mean</MenuItem>
                    <MenuItem value="median">Median</MenuItem>
                    <MenuItem value="ffill">Forward Fill</MenuItem>
                    <MenuItem value="bfill">Backward Fill</MenuItem>
                  </Select>

                  <Button
                    variant="contained"
                    size="small"
                    sx={{ mt: 2 }}
                    onClick={applyOutlierTreatment}
                  >
                    Apply Treatment
                  </Button>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Paper>
      </Grid>

      {/* RIGHT PANEL */}
      <Grid item xs={12} md={8} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
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
