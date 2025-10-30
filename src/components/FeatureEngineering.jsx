// src/components/ExploratoryDataAnalysis.jsx

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
  TextField,
  Divider,
  Button,
  FormGroup,
  Checkbox,
  ToggleButton,
  ToggleButtonGroup, 
} from "@mui/material";
import { DataGridPro } from '@mui/x-data-grid-pro';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTheme } from "@mui/material/styles";

const BACKEND_URL = "https://manufacturing-copilot-backend.onrender.com";

const FeatureEngineering = () => {
  const [edaColumns, setEdaColumns] = useState([]);
  const [edaOutput, setEdaOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedCard, setExpandedCard] = useState(false);
  const [expanded, setExpanded] = useState("");
  const theme = useTheme();
  const [error, setError] = useState("");


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
          width: expanded ? 320 : 320, //fixed width, no shrink on collapse to avoid UI issues
  }}>
            {/* Feature Generation */}
            <Accordion
              expanded={expandedCard === "featuregen"}
              onChange={handleAccordionChange("featuregen")}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                  Feature Generation
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {/* Column 1 Selection */}
                <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: "bold" }}>
                  Select Column 1
                </Typography>
                <RadioGroup
                  value={selected1}
                  onChange={(e) => setSelected1(e.target.value)}
                >
                  {edaColumns.map((col) => (
                    <FormControlLabel
                      key={col}
                      value={col}
                      control={<Radio />}
                      label={col}
                    />
                  ))}
                </RadioGroup>

                {/* Column 2 Selection */}
                <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: "bold" }}>
                  Select Column 2
                </Typography>
                <RadioGroup
                  value={selected2}
                  onChange={(e) => setSelected2(e.target.value)}
                >{/* Add None option */}
                  <FormControlLabel
                    value=""
                    control={<Radio />}
                    label="None"
                  />
                  {edaColumns.map((col) => (
                    <FormControlLabel
                      key={col}
                      value={col}
                      control={<Radio />}
                      label={col}
                    />
                  ))}
                </RadioGroup>

                {/* Column 3 Selection */}
                <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: "bold" }}>
                  Select Column 3
                </Typography>
                <RadioGroup
                  value={selected3}
                  onChange={(e) => setSelected3(e.target.value)}
                >
                  {/* Add None option */}
                  <FormControlLabel
                    value=""
                    control={<Radio />}
                    label="None"
                  />
                  {edaColumns.map((col) => (
                    <FormControlLabel
                      key={col}
                      value={col}
                      control={<Radio />}
                      label={col}
                    />
                  ))}
                </RadioGroup>


                {/* --- Dynamic Input Fields Section --- */}
                <Box sx={{ mt: 3, p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                    Create Custom Feature
                  </Typography>

                  {selected1 && (
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {/* Left operand */}
                      <TextField
                      placeholder="Enter number or function (e.g., log, sqrt)"
                      size="small"
                      value={featureInputs.beforeCol1}
                      onChange={(e) =>
                        setFeatureInputs((prev) => ({ ...prev, beforeCol1: e.target.value }))
                          }
                        />

                      {/* First column */}
                      <Typography variant="body1" sx={{ fontWeight: "bold", alignSelf: "center" }}>
                        {selected1}
                      </Typography>

                      {/* Operator if col2 exists */}
                      {selected2 && (
                        <>
                      <TextField
                          placeholder="Enter number or function (e.g., log, sqrt)"
                          size="small"
                          value={featureInputs.between1and2}
                          onChange={(e) =>
                            setFeatureInputs((prev) => ({ ...prev, between1and2: e.target.value }))
                          }
                        />
                        <TextField
                        placeholder="Enter operator between Column 1 & 2"
                        size="small"
                        value={featureInputs.op12}
                        onChange={(e) =>
                          setFeatureInputs((prev) => ({ ...prev, op12: e.target.value }))
                        }
                      />
                          <Typography variant="body1" sx={{ fontWeight: "bold", alignSelf: "center" }}>
                            {selected2}
                          </Typography>
                        </>
                      )}

                      {/* Operator if col3 exists */}
                      {selected3 && (
                        <>
                          <TextField
                          placeholder="Enter number or function (e.g., log, sqrt)"
                          size="small"
                          value={featureInputs.between2and3}
                          onChange={(e) =>
                            setFeatureInputs((prev) => ({ ...prev, between2and3: e.target.value }))
                          }
                          />
                          <TextField
                          placeholder="Enter operator between Column 2 & 3"
                          size="small"
                          value={featureInputs.op23}
                          onChange={(e) =>
                            setFeatureInputs((prev) => ({ ...prev, op23: e.target.value }))
                          }
                        />
                          <Typography variant="body1" sx={{ fontWeight: "bold", alignSelf: "center" }}>
                            {selected3}
                          </Typography>
                        </>
                      )}
                    </Box>
                  )}
                </Box>

                <Box sx={{ mt: 2, p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    Preview Formula:
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: "monospace", mt: 1 }}>
                     {finalFormula || "No formula yet"}
                  </Typography>
                </Box>
              
                
                <Button variant="contained" size="small" sx={{ mt: 2 }}
                  Generate Custom Feature
                onClick={generatefeature}>
                </Button>
              </AccordionDetails>
            </Accordion>
   
            {/* Feature Variability */}
            <Accordion
              expanded={expandedCard === "featurevar"}
              onChange={handleAccordionChange("featurevar")}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                  Feature Variability
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {/* Column Selection */}
                <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: "bold" }}>
                  Select Column
                </Typography>
                <RadioGroup
                  value={selectedForVariability}
                  onChange={(e) => setSelectedForVariability(e.target.value)}
                >
                  {augmented_df_columns.map((col) => (
                    <FormControlLabel
                      key={col}
                      value={col}
                      control={<Radio />}
                      label={col}
                    />
                  ))}
                </RadioGroup>

                <Button variant="contained" size="small" sx={{ mt: 2 }}
                  Generate Feature Variability
                  onClick={generateFeatureVariability}>
                </Button>

                </AccordionDetails>
                </Accordion>

                {/* Feature Misisng Value Analysis */}
            <Accordion
              expanded={expandedCard === "featuremissing"}
              onChange={handleAccordionChange("featuremissing")}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                  Feature Missing Value Analysis
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {/* Column Selection */}
                <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: "bold" }}>
                  Select Column
                </Typography>
                <RadioGroup
                  value={selectedForMissing}
                  onChange={(e) => setSelectedForMissing(e.target.value)}
                >
                  {augmented_df_columns.map((col) => (
                    <FormControlLabel
                      key={col}
                      value={col}
                      control={<Radio />}
                      label={col}
                    />
                  ))}
                </RadioGroup>

                <Button variant="contained" size="small" sx={{ mt: 2 }}
                  Generate Feature Missing Value Analysis
                  onClick={generateFeatureMissingAnalysis}>
                </Button>

                </AccordionDetails>
                </Accordion>

                {/* Feature Outlier Analysis */}
            <Accordion
              expanded={expandedCard === "featureoutlier"}
              onChange={handleAccordionChange("featureoutlier")}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                  Feature Outlier Analysis
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {/* Column Selection */}
                <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: "bold" }}>
                  Select Column
                </Typography>
                <RadioGroup
                  value={selectedForOutlier}
                  onChange={(e) => setSelectedForOutlier(e.target.value)}
                >
                  {augmented_df_columns.map((col) => (
                    <FormControlLabel
                      key={col}
                      value={col}
                      control={<Radio />}
                      label={col}
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

                <Button variant="contained" size="small" sx={{ mt: 2 }}
                  Generate Feature Missing Value Analysis
                  onClick={generateFeatureOutlierAnalysis}>
                </Button>

                </AccordionDetails>
                </Accordion>
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

      {/* Custom Feature Output (renders independently) */}
      {featureOutput && (
        <Box sx={{ mt: 2, p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            Custom Feature Generation
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, fontFamily: "monospace" }}>
            {featureOutput.message}
          </Typography>

          {Array.isArray(featureOutput.errors) && featureOutput.errors.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="error">
                Rows with errors: {featureOutput.errors.join(", ")}
              </Typography>
            </Box>
          )}
        </Box>
      )}
      {/* Custom feature generation dialog box*/}
      <Dialog open={showFeatureGenPrompt} onClose={() => setShowFeatureGenPrompt(false)}>
        <DialogTitle>Status of custom feature generation</DialogTitle>
        <DialogContent>
          <Typography>
            {featureOutput?.message || "Processing feature generation..."}
          </Typography>
        </DialogContent>
      </Dialog>

    </Box>
  </Paper>
</Grid>

    </Grid>
  );
};

export default FeatureEngineering;
