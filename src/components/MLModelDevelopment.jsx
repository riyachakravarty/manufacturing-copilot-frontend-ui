// src/components/MLModelDevelopment.jsx

import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
//import axios from "axios";
import {
//  Dialog,
//  DialogTitle,
//  DialogContent,
  Box,
  Paper, 
  CircularProgress,
  Alert,
  Typography,
  Grid,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
//  RadioGroup,
  FormControlLabel,
//  Radio,
  Slider,
  TextField,
  Divider,
  Button,
  FormGroup,
  Checkbox,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTheme } from "@mui/material/styles";
import AIInterpretationContent from "./AIInterpretationContent";
import AIInterpretationContentFI from "./AIInterpretationContentFI";
import AIInterpretationContentModel from "./AIInterpretationContentModel";
const BACKEND_URL = "https://manufacturing-copilot-backend.onrender.com";

const MLModelDevelopment = () => {
  const [edaColumns, setEdaColumns] = useState([]);
//  const [loading, setLoading] = useState(false);
  const [expandedCard, setExpandedCard] = useState(false);
//  const [expanded, setExpanded] = useState("");
  const theme = useTheme();
  const [error, setError] = useState("");
  const [targetColumn, setTargetColumn] = useState("");
  const [performanceDirection, setPerformanceDirection] = useState("higher");
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [TrainTestOption, setTrainTestOption] = useState("");
  const [splitPercent, setSplitPercent] = useState(70);
  const [startDate, setStartDate] = useState(dayjs().subtract(30, "day"));
  const [endDate, setEndDate] = useState(dayjs());
  const [MLChoice, setMLChoice] = useState("");
  const [loading, setLoading] = useState(false);
  const [trainMetrics, setTrainMetrics] = useState(null);
  const [testMetrics, setTestMetrics] = useState(null);
  const [trainPlot, setTrainPlot] = useState(null);
  const [testPlot, setTestPlot] = useState(null);
  const [trainTimeseriesPlot, setTrainTimeseriesPlot] = useState(null);
  const [testTimeseriesPlot, setTestTimeseriesPlot] = useState(null);
  const [modelInterpretation, setModelInterpretation] =useState(null);
  //const [deviationInterpretation, setDeviationInterpretation] =useState(null);
  // SHAP plots and states
  const [featureImportance, setFeatureImportance] = useState(null);
  const [optimalRanges, setOptimalRanges] = useState(null);
  const [shapLoading, setShapLoading] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState(null);// "train" | "feature_importance" | "optimal_ranges"

  // Helper function to render metric cards
  const renderMetrics = (metrics, title) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
          {title}
        </Typography>
        {Object.entries(metrics || {}).map(([key, val]) => (
          <Typography key={key} variant="body2">
            {key}: {val}
          </Typography>
        ))}
      </CardContent>
    </Card>
  );



  // Fetch column names from backend
  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/get_columns`);
        if (!res.ok) throw new Error("Failed to fetch columns");
        const data = await res.json();
        setEdaColumns(data.columns || []);
      } catch (err) {
        console.error("Error fetching columns:", err);
      }
    };

    fetchColumns();
  }
//  , [BACKEND_URL]
);

  // Card toggle
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedCard(isExpanded ? panel : false);
    setError("");
  };

  useEffect(() => {
    console.log("STATE UPDATE → activeAnalysis:", activeAnalysis);
  }, [activeAnalysis]);
  
  useEffect(() => {
    console.log("CHECK modelInterpretation:", modelInterpretation);
    console.log("CHECK model_assessment:", modelInterpretation?.model_assessment);
    console.log("CHECK risk_assessment:", modelInterpretation?.risk_assessment);
  }, [modelInterpretation]);

  useEffect(() => {
    console.log("AI PANEL → activeAnalysis:", activeAnalysis);
    console.log("AI PANEL → modelInterpretation:", modelInterpretation);
  }, [activeAnalysis, modelInterpretation]);


// Function to train the ML model

  const handleTrainModel = async () => {
    try {
      setLoading(true);
      setError("");
      setTrainMetrics(null);
      setTestMetrics(null);
      setTrainPlot(null);
      setTestPlot(null);
      setTrainTimeseriesPlot(null);
      setTestTimeseriesPlot(null);

      // --- Validation ---
      if (!targetColumn) {
        setError("Please select a target or objective variable.");
        setLoading(false);
        return;
      }
      if (!performanceDirection || !["maximize", "minimize"].includes(performanceDirection.toLowerCase())) {
        setError("Please select whether to maximize or minimize the target.");
        setLoading(false);
        return;
      }
      if (!selectedFeatures || selectedFeatures.length === 0) {
        setError("Please select at least one feature to build the ML model.");
        setLoading(false);
        return;
      }

    if (
      (TrainTestOption === "random" || TrainTestOption === "time_percent") &&
      (splitPercent === null || splitPercent <= 0 || splitPercent >= 100)
    ) {
      setError("Please specify a valid split percentage between 1 and 99.");
      return;
    }

    if (TrainTestOption === "time_custom" && (!startDate || !endDate)) {
      setError("Please select valid start and end dates for custom time-based split.");
      return;
    }

    // Prepare payload for backend
    const payload = {
      target: targetColumn,
      performanceDirection, // "maximize" or "minimize"
      features: selectedFeatures,
      trainTestOption: TrainTestOption, // "random", "time_percent", or "time_custom"
      splitPercent:
        TrainTestOption === "time_custom" ? null : splitPercent, // used only for random/time_percent
      startDate:
        TrainTestOption === "time_custom" ? startDate : null,    // only relevant for time_custom
      endDate:
        TrainTestOption === "time_custom" ? endDate : null,      // only relevant for time_custom
      modelType: MLChoice,
};
    const res = await fetch(`${BACKEND_URL}/train_model`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText);
    }

    const result = await res.json();
    console.log("FULL BACKEND RESPONSE:", result);
    
    if (!result.success) {
      throw new Error(result.error || "Unknown error while training model");
    }

    // --- Store results ---
    setTrainMetrics(result.metrics_train);
    setTestMetrics(result.metrics_test);
    setTrainPlot(result.plot_train);
    setTestPlot(result.plot_test);
    setTrainTimeseriesPlot(result.plot_train_timeseries);
    setTestTimeseriesPlot(result.plot_test_timeseries);
    setModelInterpretation(result.model_interpretation)
    console.log("Model Interpretation:", result.model_interpretation);

    //setDeviationInterpretation(result.deviation_interpretation)
    //console.log("Deviation Interpretation:", result.deviation_interpretation);

    setActiveAnalysis("train");

    setFeatureImportance(null);
    setOptimalRanges(null);
  } catch (err) {
    console.error("Error training model:", err);
    setError(err.message || "Error during training");
  } finally {
    setLoading(false);
  }
};

// --- Generate Feature Importance ---
  const handleGenerateFeatureImportance = async () => {
    try {
      setShapLoading(true);
      setError(null);

      const response = await fetch(`${BACKEND_URL}/feature_importance`, {
        method: "GET",
      });

      if (!response.ok) throw new Error("Failed to fetch feature importance plot");

      const result = await response.json();
      setFeatureImportance(result);
      setActiveAnalysis("feature_importance");

      // 🔴 clear train/test plots
      setTrainPlot(null);
      setTestPlot(null);
      setTrainMetrics(null);
      setTestMetrics(null);

      // 🔴 clear other analysis
      setOptimalRanges(null);
    } catch (err) {
      console.error("Error loading feature importance:", err);
      setError("Failed to generate feature importance plot");
    } finally {
      setShapLoading(false);
    }
  };

  // --- Generate Optimal Operating Ranges ---
  const handleGenerateOptimalRanges = async () => {
    try {
      setShapLoading(true);
      setError(null);

      const response = await fetch(`${BACKEND_URL}/optimal_ranges`, {
        method: "GET",
      });

      if (!response.ok) throw new Error("Failed to fetch optimal ranges plot");

      const result = await response.json();
      setOptimalRanges(result);
      setActiveAnalysis("optimal_ranges");
      setTrainPlot(null);
      setTestPlot(null);
      setTrainMetrics(null);
      setTestMetrics(null);
      setFeatureImportance(null);
    } catch (err) {
      console.error("Error loading optimal ranges:", err);
      setError("Failed to generate optimal operating ranges plot");
    } finally {
      setShapLoading(false);
    }
  };

    return (
    <Grid container spacing={2} sx={{ flexGrow: 1, minHeight: 0 }}>
      {/* Left Panel */}
      <Grid item 
        xs={12}
        md="auto"
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          //px: 1,
          fontSize: "0.85rem",
          flexShrink: 0,
          minWidth: 320,
          transition: "width 0.3s ease",
          width: 320, // fixed like DVE
          minHeight: 0,
  }}>
          <Card
          sx={{
            borderRadius: 3,
            boxShadow: 2,
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
        <CardContent
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            minHeight: 0,
          }}
        >
            {/* Target Dropdown */}
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Target / Objective</InputLabel>
              <Select
                value={targetColumn}
                label="Target / Objective"
                onChange={(e) => setTargetColumn(e.target.value)}
              >
                {edaColumns.map((col) => (
                  <MenuItem key={col} value={col}>
                    {col}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Performance Direction Toggle */}
            <ToggleButtonGroup
              value={performanceDirection}
              exclusive
              onChange={(e, val) => val && setPerformanceDirection(val)}
              size="small"
              sx={{ mb: 3 }}
            >
              <ToggleButton value="maximize">Maximize</ToggleButton>
              <ToggleButton value="minimize">Minimize</ToggleButton>
            </ToggleButtonGroup>

            {/* Multi-select column list */}
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={selectedFeatures.length === edaColumns.length}
                        onChange={(e) => 
                          setSelectedFeatures(
                            e.target.checked ? edaColumns : []
                          )
                        }
                      />
                    }
                    label="Select All"
                  />
                  {edaColumns.map((col) => (
                    <FormControlLabel
                      key={col}
                      control={
                        <Checkbox
                          checked={selectedFeatures.includes(col)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFeatures([...selectedFeatures, col]);
                            } else {
                              setSelectedFeatures(selectedFeatures.filter((c) => c !== col));
                            }
                          }
                          }
                        />
                      }
                      label={col}
                    />
                  ))}
                </FormGroup>

                {/* Train Test dropdown */}
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Train & Test data</InputLabel>
              <Select
                value={TrainTestOption}
                label="Train & Test Split"
                onChange={(e) => setTrainTestOption(e.target.value)}
              >
                <MenuItem value="random">Random</MenuItem>
                <MenuItem value="time_percent">Time Based - Choose split %</MenuItem>
                <MenuItem value="time_custom">Time Based - Choose custom dates</MenuItem>
            </Select>
        </FormControl>

        {/* Slider for Random or Time-Based % */}
      {(TrainTestOption === "random" || TrainTestOption === "time_percent") && (
        <Box sx={{ px: 2, mt: 2 }}>
          <Typography gutterBottom>
            Select % of data for training: {splitPercent}%
          </Typography>
          <Slider
            value={splitPercent}
            onChange={(e, newValue) => setSplitPercent(newValue)}
            aria-labelledby="train-test-slider"
            step={1}
            min={0}
            max={100}
            valueLabelDisplay="auto"
          />
        </Box>
      )}

      {/* Date Pickers for Custom Date Split */}
      {TrainTestOption === "time_custom" && (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth size="small" />}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth size="small" />}
            />
          </Box>
        </LocalizationProvider>
      )}

  {/* ML model choice */}
              <Accordion
                expanded={expandedCard === "MLChoice"}
                onChange={handleAccordionChange("MLChoice")}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                    ML model Development
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {/* ML model list */}
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Choose ML Model</InputLabel>
              <Select
                value={MLChoice}
                label="Choose ML Model"
                onChange={(e) => setMLChoice(e.target.value)}
              >
                <MenuItem value="Decision Tree">Decision Tree</MenuItem>
                <MenuItem value="Random Forest">Random Forest</MenuItem>
                <MenuItem value="XGBoost">XGBoost</MenuItem>
                <MenuItem value="Light GBM">Light GBM</MenuItem>
            </Select>
        </FormControl>
  
                  <Button variant="contained" size="small" sx={{ mt: 2 }}
                  onClick={handleTrainModel}>
        Train ML Model
                  </Button>
                </AccordionDetails>
              </Accordion>

              {/* ML model choice */}
                  <Button variant="contained" size="small" sx={{ mt: 2 }} 
                  onClick={handleGenerateFeatureImportance}
                  disabled={shapLoading}
                  >
        Generate Feature Importance
                  </Button>
                
                <Button variant="contained" size="small" sx={{ mt: 2 }}
                onClick={handleGenerateOptimalRanges}
                disabled={shapLoading}
                >
        Generate Optimal Operating Ranges
                  </Button>

            
          </CardContent>
        </Card>
      </Grid>


{/* Right Panel */}
<Grid
  item
  xs={12}
  md
  sx={{
    height: "100%",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    minHeight: 0,
    flexShrink: 1,          // allow growth
   flexGrow: 1,
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
    <Box sx={{ display: "flex", justifyContent: "space-between",alignItems: "center", mb: 2, flexShrink: 0 }}>
      <Typography variant="h6" gutterBottom color="primary">
        Analysis Output
      </Typography>

      {/* Latest Augmented Data Download */}    
        <Button
          variant="contained"
          color="secondary"
          size="small"
          onClick={async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/download`);
    if (!response.ok) throw new Error("Download failed");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "feature_data.csv"; // same name as backend header
    link.click();
  } catch (err) {
    console.error(err);
    setError("Failed to download file from server.");
  }
}}

        >
          Download Latest Data
        </Button>
</Box>
    <Divider sx={{ mb: 2 }} />

    {/* Content Scroll Area */}
    <Box sx={{ flexGrow: 1, overflowY: "auto", minHeight: 0 }}>
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: 300 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error Message */}
      {error && <Alert severity="error">{error}</Alert>}

      {/* Metrics and Plots */}
      {!loading && !error && (
        <>
          {/* --- Metrics --- */}
          {activeAnalysis === "train" &&(trainMetrics || testMetrics) && (
            <Box>
              {trainMetrics && renderMetrics(trainMetrics, "Training Metrics")}
              {testMetrics && renderMetrics(testMetrics, "Test Metrics")}
            </Box>
          )}

          {/* --- Train Actual vs Predicted Plot --- */}
          {activeAnalysis === "train" && trainPlot && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                  Predicted vs Actual (Train Data)
                </Typography>
                <Plot
                  data={trainPlot.data}
                  layout={{
                    ...trainPlot.layout,
                    autosize: true,
                    paper_bgcolor: theme.palette.background.paper,
                    plot_bgcolor: theme.palette.background.default,
                    margin: { t: 40, b: 40, l: 40, r: 40 },
                  }}
                  useResizeHandler
                  style={{ width: "100%", height: "100%", minHeight: 400 }}
                />
              </CardContent>
            </Card>
          )}

          {/* --- Test Actual vs Predicted Plot --- */}
          {activeAnalysis === "train" && testPlot && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                  Predicted vs Actual (Test Data)
                </Typography>
                <Plot
                  data={testPlot.data}
                  layout={{
                    ...testPlot.layout,
                    autosize: true,
                    paper_bgcolor: theme.palette.background.paper,
                    plot_bgcolor: theme.palette.background.default,
                    margin: { t: 40, b: 40, l: 40, r: 40 },
                  }}
                  useResizeHandler
                  style={{ width: "100%", height: "100%", minHeight: 400 }}
                />
              </CardContent>
            </Card>
          )}

          {/* --- Train Actual vs Predicted Plot --- */}
          {activeAnalysis === "train" && trainTimeseriesPlot && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                  Predicted vs Actual Timeseies (Train Data)
                </Typography>
                <Plot
                  data={trainTimeseriesPlot.data}
                  layout={{
                    ...trainTimeseriesPlot.layout,
                    autosize: true,
                    paper_bgcolor: theme.palette.background.paper,
                    plot_bgcolor: theme.palette.background.default,
                    margin: { t: 40, b: 40, l: 40, r: 40 },
                  }}
                  useResizeHandler
                  style={{ width: "100%", height: "100%", minHeight: 400 }}
                />
              </CardContent>
            </Card>
          )}

          {/* --- Test Actual vs Predicted Plot --- */}
          {activeAnalysis === "train" && testTimeseriesPlot && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                  Predicted vs Actual Timeseries (Test Data)
                </Typography>
                <Plot
                  data={testTimeseriesPlot.data}
                  layout={{
                    ...testTimeseriesPlot.layout,
                    autosize: true,
                    paper_bgcolor: theme.palette.background.paper,
                    plot_bgcolor: theme.palette.background.default,
                    margin: { t: 40, b: 40, l: 40, r: 40 },
                  }}
                  useResizeHandler
                  style={{ width: "100%", height: "100%", minHeight: 400 }}
                />
              </CardContent>
            </Card>
          )}

          {/* --- Default Message if No Outputs Yet --- */}
          {!trainMetrics && !testMetrics && !trainPlot && !testPlot && (
            <Typography variant="body2" color="text.secondary">
              No analysis results yet.
            </Typography>
          )}
        </>
      )}

{/* --- Feature Importance Plot --- */}
{activeAnalysis === "feature_importance" && featureImportance && (
  <Card sx={{ mt: 2 }}>
    <CardContent>
      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
        SHAP Feature Importance
      </Typography>
      <Plot
        data={featureImportance.plot.data}
        layout={{
          ...featureImportance.plot.layout,
          autosize: true,
          paper_bgcolor: theme.palette.background.paper,
          plot_bgcolor: theme.palette.background.default,
          margin: { t: 40, b: 40, l: 60, r: 40 },
        }}
        useResizeHandler
        style={{ width: "100%",  minHeight: 450 }}
      />

    </CardContent>
  </Card>
)}



{/* --- Optimal Operating Ranges Plot --- */}
{activeAnalysis === "optimal_ranges" && optimalRanges && (
  <Card sx={{ mt: 2 }}>
    <CardContent>
      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
        SHAP Dependence / Optimal Operating Ranges
      </Typography>
      <Plot
        data={optimalRanges.plot.data}
        layout={{
          ...optimalRanges.plot.layout,
          autosize: true,
          paper_bgcolor: theme.palette.background.paper,
          plot_bgcolor: theme.palette.background.default,
          margin: { t: 40, b: 40, l: 60, r: 40 },
        }}
        useResizeHandler
        style={{ width: "100%", height: "100%", minHeight: 400 }}
      />
    </CardContent>
  </Card>
)}

    </Box>
  </Paper>
</Grid>

{/* AI led Interpretation panel */}
<Grid
  item
  xs={12}
  md="auto"
  sx={{
    height: "100%",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    fontSize: "0.85rem",
    width: 480,
    minHeight: 0,
  }}
>
<Paper sx={{ p: 2, height: "100%", overflowY: "auto" }}>
<Box
  sx={{
    position: "sticky",
    top: 0,
    zIndex: 2,
    bgcolor: "background.paper",
    pb: 1,
    mb: 2,
    borderBottom: "1px solid",
    borderColor: "divider",
  }}
>
  <Typography variant="h6" color="primary">
    AI led Interpretation
  </Typography>
  </Box>

      {activeAnalysis === "feature_importance" && featureImportance && (
  <Card sx={{ mt: 2 }}>
    <CardContent>
      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
        SHAP Feature Importance
      </Typography>

      <AIInterpretationContentFI
  explanation={featureImportance.interpretation}
  sources={featureImportance.sources}
/>

    </CardContent>
  </Card>
)}

{activeAnalysis === "optimal_ranges" && optimalRanges && (
  <Card sx={{ mt: 2 }}>
    <CardContent>
      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
        SHAP Dependence / Optimal Operating Ranges
      </Typography>

    <AIInterpretationContent
  rows={optimalRanges.interpretation_table}
  sources={optimalRanges.sources}
/>
</CardContent>
      </Card>
)}

{modelInterpretation && (
  <Card sx={{ mt: 2, bgcolor: "red" }}>
    <CardContent>
      <Typography>MODEL INTERPRETATION TEST</Typography>
    </CardContent>
  </Card>
)}




  </Paper>
    </Grid>   
    </Grid>
  );
};

export default MLModelDevelopment;
