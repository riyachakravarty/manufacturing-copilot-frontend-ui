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
  const [outlierColumn, setOutlierColumn] = useState("");
  const [outlierMethod, setOutlierMethod] = useState("zscore");
  const [outlierPlot, setOutlierPlot] = useState(null);

  // For treatment cards
  const [treatmentMethod, setTreatmentMethod] = useState("Mean");

  // Missing datetime intervals fetched from backend
  const [missingDateTimeIntervals, setMissingDateTimeIntervals] = useState([]);
  const [loadingTreatment, setLoadingTreatment] = useState(false);

  // Selected items for treatment cards
  const [treatmentSelectedColumns, setTreatmentSelectedColumns] = useState([]);
  const [treatmentSelectedIntervals, setTreatmentSelectedIntervals] = useState([]);

  // Outlier treatment states
  //const [outlierMethod, setOutlierMethod] = useState("zscore");
  const [outlierSelectedColumns, setOutlierSelectedColumns] = useState([]);
  const [outlierSelectedIntervals, setOutlierSelectedIntervals] = useState([]);
  const [outlierTreatmentMethod, setOutlierTreatmentMethod] = useState("Mean");

  // Mock intervals fallback (not used now but kept for legacy or testing)
  const mockIntervals = [
    "2025-08-01 10:00 to 2025-08-01 12:00",
    "2025-08-02 14:00 to 2025-08-02 16:30",
    "2025-08-03 09:15 to 2025-08-03 10:45",
    "2025-08-04 11:00 to 2025-08-04 13:00",
    "2025-08-05 15:30 to 2025-08-05 17:00",
    "2025-08-06 08:00 to 2025-08-06 09:30",
  ];

  useEffect(() => {
    // Fetch columns on mount
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

  useEffect(() => {
    // Fetch missing datetime intervals from backend when treatment card expands & mode is datetime
    if (expanded === "missingTreatment" && treatmentMode === "datetime") {
      const fetchIntervals = async () => {
        try {
          const res = await fetch(`${BACKEND_URL}/missing_datetime_intervals`);
          if (!res.ok) throw new Error("Failed to fetch missing datetime intervals");
          const data = await res.json();
          if (Array.isArray(data.intervals)) {
            setMissingDateTimeIntervals(data.intervals);
          } else {
            setMissingDateTimeIntervals([]);
          }
        } catch (err) {
          console.error(err);
          setError("Error fetching missing datetime intervals");
        }
      };
      fetchIntervals();
    }
  }, [expanded, treatmentMode]);

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
      setError("Please select a column for analysis.");
      return;
    }
    setLoading(true);
    setError("");
    setPlotData(null);

    try {
      const prompt = `Missing value analysis where selected variable is ${missingValueColumn}`;
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const result = await response.json();

      if (result.type === "plot" && result.data) {
        setPlotData(result.data);
        setExpanded(false); // Collapse left accordion to free space
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

  const runOutlierAnalysis = async () => {
    if (!outlierColumn) {
      alert("Please select a column for outlier analysis.");
      return;
    }

    try {
      const prompt = `outlier analysis where selected variable is ${outlierColumn} using method ${outlierMethod}`;
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const result = await response.json();

      if (result.type === "plot" && result.data) {
        setPlotData(result.data);   // Same as missing value analysis
        setExpanded(false);         // Collapse left panel like before
      } else {
        console.error("Unexpected response format:", result);
      }
    } catch (err) {
      console.error("Error running outlier analysis:", err.message);
    }
  };

  // Treatment cards handlers
  const handleTreatmentColumnToggle = (col) => {
    setTreatmentSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const handleTreatmentIntervalToggle = (interval) => {
    setTreatmentSelectedIntervals((prev) => {
      const exists = prev.some(
        (i) => i.start === interval.start && i.end === interval.end
      );
      if (exists) {
        return prev.filter(
          (i) => !(i.start === interval.start && i.end === interval.end)
        );
      } else {
        return [...prev, interval];
      }
    });
  };

  const handleOutlierColumnToggle = (col) => {
    setOutlierSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const handleOutlierIntervalToggle = (intervalStr) => {
    setOutlierSelectedIntervals((prev) =>
      prev.includes(intervalStr) ? prev.filter((i) => i !== intervalStr) : [...prev, intervalStr]
    );
  };

  // Apply missing value treatment
  const applyMissingValueTreatment = async () => {
    if (treatmentMode === "datetime") {
      if (treatmentSelectedColumns.length === 0) {
        setError("Please select at least one column for treatment.");
        return;
      }
      if (treatmentSelectedIntervals.length === 0) {
        setError("Please select at least one interval for treatment.");
        return;
      }
      if (!treatmentMethod) {
        setError("Please select a treatment method.");
        return;
      }

      setLoadingTreatment(true);
      setError("");

      // Convert selected intervals (string) to [{start:..., end:...}, ...] format expected by backend
      // Assuming intervals strings are like "2025-08-01 10:00 to 2025-08-01 12:00"
      
      //const formattedIntervals = treatmentSelectedIntervals.map((intervalStr) => {
        //const [start, end] = intervalStr.split(" to ");
        //return { start, end };
      //});

      try {
        const payload = {
          columns: treatmentSelectedColumns,
          intervals: treatmentSelectedIntervals,
          method: treatmentMethod,
        };
        console.log("Sending payload:", payload);

        const res = await fetch(`${BACKEND_URL}/apply_treatment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`Treatment failed with status ${res.status}`);
        const result = await res.json();
        console.log("Treatment response:", result);
        setError("Treatment applied successfully.");
        // Optionally clear selections
        setTreatmentSelectedColumns([]);
        setTreatmentSelectedIntervals([]);
      } catch (err) {
        console.error("Error applying treatment:", err);
        setError("Error applying missing value treatment:"+ err.message);
      } finally {
        setLoadingTreatment(false);
      }
    } else {
      setError("Treatment mode not implemented yet.");
    }
  };

  // Apply outlier treatment placeholder
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
        md={4}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          px: 1,
          fontSize: "0.85rem",
          flexShrink: 0,
          minWidth: 320, // maintain minimum width even if collapsed
          transition: "width 0.3s ease",
          width: expanded ? 320 : 320, // fixed width, no shrink on collapse to avoid UI issues
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
                maxWidth: 300,
                overflowY: "auto",
                maxHeight: 300,
                pr: 1,
              }}
            >
              <RadioGroup
                value={missingValueColumn}
                onChange={(e) => setMissingValueColumn(e.target.value)}
                sx={{ maxWidth: "100%" }}
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
              <Button variant="contained" size="small" sx={{ mt: 1 }} onClick={runMissingValueAnalysis}>
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

              {treatmentMode === "datetime" && (
                <Grid container spacing={2}>
                  {/* Column List */}
                  <Grid
                    item
                    xs={4}
                    sx={{
                      maxHeight: 200,
                      overflowY: "auto",
                      borderRight: "1px solid #ccc",
                      pr: 1,
                    }}
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
    {missingDateTimeIntervals.length > 0 ? (
      missingDateTimeIntervals.map((interval) => {
        const label = `${interval.start} to ${interval.end}`;
        const checked = treatmentSelectedIntervals.some(
          (i) => i.start === interval.start && i.end === interval.end
        );
        return (
          <FormControlLabel
            key={label}
            control={
              <Checkbox
                size="small"
                checked={checked}
                onChange={() => handleTreatmentIntervalToggle(interval)}
              />
            }
            label={label}
            sx={{ fontSize: "0.85rem" }}
          />
        );
      })
    ) : (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        No missing datetime intervals found.
      </Typography>
    )}
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
                      <MenuItem value="Mean">Mean</MenuItem>
                      <MenuItem value="Median">Median</MenuItem>
                      <MenuItem value="Forward fill">Forward Fill</MenuItem>
                      <MenuItem value="Backward fill">Backward Fill</MenuItem>
                      <MenuItem value="Delete rows">Delete rows</MenuItem>
                    </Select>

                    <Button
                      variant="contained"
                      size="small"
                      sx={{ mt: 2 }}
                      onClick={applyMissingValueTreatment}
                      disabled={loadingTreatment}
                    >
                      {loadingTreatment ? "Applying..." : "Apply Treatment"}
                    </Button>
                  </Grid>
                </Grid>
              )}

              {treatmentMode === "column" && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Treatment mode "Missing Values in Column" not implemented yet.
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Outlier Analysis */}
          <Accordion expanded={expanded === "outlierAnalysis"} onChange={handleExpand("outlierAnalysis")}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                Outlier Analysis
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                maxWidth: 300,
                overflowY: "auto",
                maxHeight: 300,
                pr: 1,
              }}
            >
              {/* Column Selection */}
              <RadioGroup
                value={outlierColumn}
                onChange={(e) => setOutlierColumn(e.target.value)}
                sx={{ maxWidth: "100%" }}
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

              {/* Method Selection */}
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

              {/* Run Button */}
              <Button
                variant="contained"
                size="small"
                sx={{ mt: 1 }}
                onClick={runOutlierAnalysis}
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
                    <MenuItem value="Mean">Mean</MenuItem>
                    <MenuItem value="Median">Median</MenuItem>
                    <MenuItem value="Forward fill">Forward Fill</MenuItem>
                    <MenuItem value="Backward fill">Backward Fill</MenuItem>
                    <MenuItem value="Delete rows">Delete rows</MenuItem>
                  </Select>

                  <Button variant="contained" size="small" sx={{ mt: 2 }} onClick={applyOutlierTreatment}>
                    Apply Treatment
                  </Button>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Paper>
      </Grid>

      {/* RIGHT PANEL */}
      <Grid
        item
        xs={12}
        md={8}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          minHeight: 0,
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
                  margin: { t: 40, b: 40, l: 40, r: 40 },
                }}
                style={{ width: "100%", height: "100%", minHeight: 400, minWidth: 400 }}
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
