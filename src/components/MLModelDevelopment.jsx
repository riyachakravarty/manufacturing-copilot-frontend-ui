// src/components/MLModelDevelopment.jsx

import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
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
  RadioGroup,
  FormControlLabel,
  Radio,
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

const BACKEND_URL = "https://manufacturing-copilot-backend.onrender.com";

const MLModelDevelopment = () => {
  const [edaColumns, setEdaColumns] = useState([]);
  const [edaOutput, setEdaOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedCard, setExpandedCard] = useState(false);
  const [expanded, setExpanded] = useState("");
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

  // Feature generation
  const [selected1, setSelected1] = useState("");
  const [selected2, setSelected2] = useState("");
  const [selected3, setSelected3] = useState("");
  const [featureInputs, setFeatureInputs] = useState({
    beforeCol1: "",
    op12: "",
    between1and2: "",
    op23: "",
    between2and3: ""
});
  const [finalFormula, setFinalFormula] = useState("");
  const [showFeatureGenPrompt, setShowFeatureGenPrompt] = useState(false);

  //Feature variability
  const [selectedForVariability, setSelectedForVariability] = useState("");
  const [plotData, setPlotData] = useState(null);
  const [augmented_df_columns, setAugmented_df_columns] = useState([]);

  //Feature Missing Value Analysis
  const [selectedForMissing, setSelectedForMissing] = useState("");

  //Feature Outlier Analysis
  const [selectedForOutlier, setSelectedForOutlier] = useState("");
  const [outlierMethod, setOutlierMethod] = useState("");

  //Right panel
  const [featureOutput, setFeatureOutput] = useState(null);
  // To store latest augmented dataframe for download
  const [latestAugmentedDf, setLatestAugmentedDf] = useState(null);


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
  }, [BACKEND_URL]);

   // Fetch augmented df column names from backend for feature variability, missing and outlier analysis
  useEffect(() => {
    const fetchColumns1 = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/get_augmented_df_columns`);
        if (!res.ok) throw new Error("Failed to fetch columns");
        const data = await res.json();
        setAugmented_df_columns(data.columns || []);
      } catch (err) {
        console.error("Error fetching columns:", err);
      }
    };

    if (expandedCard === "featurevar" || expandedCard === "featuremissing" || expandedCard === "featureoutlier") {
    fetchColumns1();
  }
}, [expandedCard, BACKEND_URL]);

  // Card toggle
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedCard(isExpanded ? panel : false);
    setError("");
    setEdaOutput(null);
  };


// Auto-build formula for custom feature whenever inputs change
useEffect(() => {
  let formula = "";

  if (selected1) {
    formula += featureInputs.beforeCol1
      ? `${featureInputs.beforeCol1}(${selected1})`
      : selected1;
  }

  if (selected2) {
    formula += featureInputs.op12 ? ` ${featureInputs.op12} ` : "";
    formula += selected2
      ? featureInputs.between1and2
        ? `${featureInputs.between1and2}(${selected2})`
        : selected2
      : "";
  }

  if (selected3) {
    formula += featureInputs.op23 ? ` ${featureInputs.op23} ` : "";
    formula += selected3
      ? featureInputs.between2and3
        ? `${featureInputs.between2and3}(${selected3})`
        : selected3
      : "";
  }

  setFinalFormula(formula.trim());
}, [selected1, selected2, selected3, featureInputs]);

 //Function to trigger feature generation dialog box
  const handleFeatureGenFlow = (backendResponse) => {
  if (!backendResponse) {
    setError("No result received from backend.");
    return;
  }
  // Show pop-up prompt
  setShowFeatureGenPrompt(true);
};

const generatefeature = async () => {
  try {
    // Check if user has selected anything
    const nothingSelected =
      (!selected1 && !selected2 && !selected3) &&
      Object.values(featureInputs).every((val) => !val || val.trim() === "");

    if (nothingSelected) {
      console.error("Please select at least one column or input to create a feature");
      setFeatureOutput({ message: "⚠️ Please select at least one column or input to create a feature" });
      return;
    }

    const payload = {
      column1: selected1 || null,
      column2: selected2 || null,
      column3: selected3 || null,
      featureInputs,
    };

    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/eda/custom_feature`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Backend error:", errorText);
      setFeatureOutput({ message: `❌ Backend error: ${errorText}` });
      return;
    }

    const result = await res.json();

    // Set feature output
    if (result.success && (!result.errors || result.errors.length === 0)) {
      setFeatureOutput({ message: `✅ Feature created successfully: ${result.new_column}` });
    } else if (result.errors && result.errors.length > 0) {
      setFeatureOutput({
        message: `⚠️ Feature partially created. Errors in rows: ${result.errors.join(", ")}`,
        errors: result.errors,
        new_column: result.new_column,
      });
    } else {
      setFeatureOutput({ message: `✅ Feature created successfully: ${result.new_column}` });
    }

    // Trigger dialog box with message
    handleFeatureGenFlow(result);
    setShowFeatureGenPrompt(true);

  } catch (err) {
    console.error("Error generating custom feature:", err);
    setFeatureOutput({ message: `❌ Error: ${err.message}` });
    setShowFeatureGenPrompt(true);
  }
};

const generateFeatureVariability = async () => {
    if (selectedForVariability.length === 0) {
      setError("Please select at least one column for analysis.");
      return;
    }
    setError("");
    setLoading(true);
    setEdaOutput(null);
    try {
      const payload = {
        selectedFeature: selectedForVariability || null
      };

      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/eda/feature_variability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const result = await res.json();
        console.log("Feature variability response:", result);
      if (result.type === "plot") {
      setEdaOutput({
        data: result.data,
      })
      setExpandedCard(false); // Collapse left accordion to free space;
    }
  } catch (err) {
    console.error("Error generating variability analysis:", err);
  }
};

const generateFeatureMissingAnalysis = async () => {
    if (selectedForMissing.length === 0) {
      setError("Please select at least one column for analysis.");
      return;
    }
    setError("");
    setLoading(true);
    setEdaOutput(null);
    try {
      const payload = {
        selectedFeature: selectedForMissing || null
      };

      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/eda/feature_missing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const result = await res.json();
        console.log("Feature Missing Value Analysis response:", result);
      if (result.type === "plot") {
      setEdaOutput({
        data: result.data,
      })
      setExpandedCard(false); // Collapse left accordion to free space;
    }
  } catch (err) {
    console.error("Error generating missing value analysis:", err);
  }
};

const generateFeatureOutlierAnalysis = async () => {
    if (selectedForOutlier.length === 0) {
      setError("Please select at least one column for analysis.");
      return;
    }
    setError("");
    setLoading(true);
    setEdaOutput(null);
    try {
      const payload = {
        selectedFeature: selectedForOutlier || null,
        method: outlierMethod || null
      };

      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/eda/feature_outlier`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const result = await res.json();
        console.log("Feature Outlier Analysis response:", result);
      if (result.type === "plot") {
      setEdaOutput({
        data: result.data,
      })
      setExpandedCard(false); // Collapse left accordion to free space;
    }
  } catch (err) {
    console.error("Error generating outlier analysis:", err);
  }
};

    return (
    <Grid container spacing={2}>
      {/* Left Panel */}
      <Grid item 
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
          minWidth: 320,
          transition: "width 0.3s ease",
          width: 320, // fixed like DVE
  }}>
        <Card sx={{ borderRadius: 3, boxShadow: 2, flexGrow: 1 }}>
          <CardContent>
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
                    Choose ML model
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
  
                  <Button variant="contained" size="small" sx={{ mt: 2 }}>
                  
        Train ML Model
                  </Button>
                </AccordionDetails>
              </Accordion>

              {/* ML model choice */}
              <Accordion
                expanded={expandedCard === "SHAP"}
                onChange={handleAccordionChange("SHAP")}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                    Build SHAP plots
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
  
                  <Button variant="contained" size="small" sx={{ mt: 2 }}>
                  
        Generate SHAP plots
                  </Button>
                </AccordionDetails>
              </Accordion>

            
          </CardContent>
        </Card>
      </Grid>


{/* Right Panel */}
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
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
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

    <Box sx={{ flexGrow: 1, overflowY: "auto", minHeight: 0 }}>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {/* EDA Plot (if present) */}
      {edaOutput ? (
        <Plot
          data={edaOutput?.data?.data ?? []}
          layout={{
            ...edaOutput?.data?.layout ?? {},
            autosize: true,
            paper_bgcolor: theme.palette.background.paper,
            plot_bgcolor: theme.palette.background.default,
            margin: { t: 40, b: 40, l: 40, r: 40 },
          }}
          style={{
            width: "100%",
            height: "100%",
            minHeight: 400,
            minWidth: 400,
          }}
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
};

export default MLModelDevelopment;
