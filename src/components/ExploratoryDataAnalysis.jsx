// src/components/ExploratoryDataAnalysis.jsx

import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
//import axios from "axios";
import {
  Box,
  Paper, 
  //CircularProgress,
  //Alert,
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

const ExploratoryDataAnalysis = () => {
  const [edaColumns, setEdaColumns] = useState([]);
  const [targetColumn, setTargetColumn] = useState("");
  const [edaOutput, setEdaOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [performanceDirection, setPerformanceDirection] = useState("higher");
  const [expandedCard, setExpandedCard] = useState(false);
  const theme = useTheme();
  const [error, setError] = useState("");

  // Q-cut state
  const [selectedQcutColumns, setSelectedQcutColumns] = useState([]);
  const [qcutQuantiles, setQcutQuantiles] = useState(4);
  

  // Dual Axes Box Plots
  const [selectedX, setSelectedX] = useState("");
  const [selectedY, setSelectedY] = useState("");
  const [plotType, setPlotType] = useState("quantile"); 
  const [numBins, setNumBins] = useState(5); // default quantiles/bins
  

  // Correlation
  const [selectedCorrColumns, setSelectedCorrColumns] = useState([]);
  const [corrMethod, setCorrMethod] = useState("pearson");

  // Continuous Range Analysis
  const [minDuration, setMinDuration] = useState("");
  const [lowerPct, setLowerPct] = useState("");
  const [upperPct, setUpperPct] = useState("");
  const [maxBreak, setMaxBreak] = useState("");
  //const [continuousOutput, setContinuousOutput] = useState(null);
  //const [continuousRanges, setContinuousRanges] = useState([]);

  // Multivariate Analysis
  const [selectedMultiColumns, setSelectedMultiColumns] = useState([]);
  const [multiMode, setMultiMode] = useState("Boxplot");
  const [numMultiRanges, setnumMultiRanges] = useState(5); // default top and bottom ranges

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
  }, 
//  [BACKEND_URL]
);

  // Card toggle
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedCard(isExpanded ? panel : false);
  };

  // Function to call backend and fetch Q-cut box plots
const generateQcutBoxPlots = async () => {
  setLoading(true);
  setError("");
  try {
    if (!targetColumn || selectedQcutColumns.length === 0) {
      console.error("Target or columns not selected for Q-cut analysis");
      return;
    }

    const res = await fetch(`${BACKEND_URL}/eda/qcut_boxplot?target=${targetColumn}&quantiles=${qcutQuantiles}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selectedQcutColumns),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Backend error:", errorText);
      return;
    }

    const result = await res.json();
    console.log("Q-cut plot response:", result);

    // 🔑 Example: if backend returns {"type": "plot", "data": ...}
    if (result.type === "plot") {
      setEdaOutput({
        data: result.data,
        //layout: data.layout,
      });
    }
  } catch (err) {
    console.error("Error generating Q-cut box plots:", err);
  }
};

// Function to call backend and fetch Dual Axes box plots
const generateDualAxesBoxPlots = async () => {
  try {
    if (!selectedX || !selectedY) {
      console.error("Please select both X and Y columns");
      return;
    }

    const res = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/eda/dualaxes_boxplot`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              column_x: selectedX,
              column_y: selectedY,
              plot_type: plotType,            // "quantile" or "auto"
              num_bins_quantiles: numBins,    // user input number
            }),
          }
        );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Backend error:", errorText);
      return;
    }

    const result = await res.json();
    console.log("Dual axes box plot response:", result);

    // 🔑 Example: if backend returns {"type": "plot", "data": ...}
    if (result.type === "plot") {
      setEdaOutput({
        data: result.data,
        //layout: data.layout,
      });
    }
  } catch (err) {
    console.error("Error generating Dual axes box plots:", err);
  }
};

const generateCorrelationAnalysis = async () => {
  try {
    if (selectedCorrColumns.length < 2) {
      console.error("Select at least two columns for correlation analysis");
      return;
    }

    const res = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/eda/correlation_analysis`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          columns: selectedCorrColumns,
          method: corrMethod,
        }),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Backend error:", errorText);
      return;
    }

    const result = await res.json();
    console.log("Correlation analysis response:", result);

    if (result.type === "plot") {
      setEdaOutput({
        data: result.data,
      });
    }
  } catch (err) {
    console.error("Error generating correlation analysis:", err);
  }
};

const generateContRangeAnalysis = async () => {
  try{  
  const res = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/eda/continuous_range`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: targetColumn,   // from dropdown / radio
          min_duration: minDuration,
          lower_pct: lowerPct,
          upper_pct: upperPct,
          max_break: maxBreak,
        }),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Backend error:", errorText);
      return;
    }

    const result = await res.json();
    console.log("Continuous range analysis result:", result);

    if (result.type === "plot") {
      setEdaOutput({
        data: result.data,
        ranges: result.ranges,
      });
    }
  } catch (err) {
    console.error("Error generating continuous range analysis:", err);
  }
};

const generatemultivariateanalysis = async () => {
  try{  
  const res = await fetch(
      `${process.env.REACT_APP_BACKEND_URL}/eda/multivariate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: multiMode,
          target: targetColumn,   // from dropdown / radio
          columns: selectedMultiColumns,
          numMultiRanges: numMultiRanges,
          performanceDirection: performanceDirection
        }),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Backend error:", errorText);
      return;
    }

    const result = await res.json();
    console.log("Multivariate analysis result:", result);

    if (result.type === "plot") {
      setEdaOutput({
        data: result.data,
        groups: result.groups,
      });
    }
  } catch (err) {
    console.error("Error generating multivariate analysis:", err);
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
              <ToggleButton value="higher">Higher the better</ToggleButton>
              <ToggleButton value="lower">Lower the better</ToggleButton>
            </ToggleButtonGroup>

            {/* Specialized Q-cut Box Plots */}
            <Accordion
              expanded={expandedCard === "qcut"}
              onChange={handleAccordionChange("qcut")}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                  Specialized Q-cut Box Plots
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {/* Multi-select column list */}
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={selectedQcutColumns.length === edaColumns.length}
                        onChange={(e) => 
                          setSelectedQcutColumns(
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
                          checked={selectedQcutColumns.includes(col)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedQcutColumns([...selectedQcutColumns, col]);
                            } else {
                              setSelectedQcutColumns(selectedQcutColumns.filter((c) => c !== col));
                            }
                          }
                          }
                        />
                      }
                      label={col}
                    />
                  ))}
                </FormGroup>

                <TextField
                  fullWidth
                  size="small"
                  label="Number of quantiles for Target"
                  type="number"
                  value={qcutQuantiles}
                  onChange={(e) => setQcutQuantiles(e.target.value)}
                  sx={{ mt: 2 }}
                />
                <Button variant="contained" size="small" sx={{ mt: 2 }}
                onClick={generateQcutBoxPlots}>
      Generate Q-cut Analysis
                </Button>
              </AccordionDetails>
            </Accordion>

            {/* Dual Axes Box Plots */}
            <Accordion
              expanded={expandedCard === "dualAxes"}
              onChange={handleAccordionChange("dualAxes")}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                  Dual Axes Box Plots
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {/* Column X Selection */}
                <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: "bold" }}>
                  Select Column X
                </Typography>
                <RadioGroup
                  value={selectedX}
                  onChange={(e) => setSelectedX(e.target.value)}
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

                {/* Column Y Selection */}
                <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: "bold" }}>
                  Select Column Y
                </Typography>
                <RadioGroup
                  value={selectedY}
                  onChange={(e) => setSelectedY(e.target.value)}
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

                {/* Box Plot Mode Toggle */}
                <Typography variant="subtitle1" sx={{ mt: 3, fontWeight: "bold" }}>
                  Select Box Plot Type
                </Typography>
                <RadioGroup
                  value={plotType}
                  onChange={(e) => setPlotType(e.target.value)}
                  row
                >
                  <FormControlLabel
                    value="auto"
                    control={<Radio />}
                    label="Interval width based ranges"
                  />
                  <FormControlLabel
                    value="quantile"
                    control={<Radio />}
                    label="Quantile based ranges"
                  />
                </RadioGroup>

                {/* Show input field for number of bins pr quantiles */}
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      label="Number of Quantiles / Bins"
                      type="number"
                      size="small"
                      value={numBins}
                      onChange={(e) => setNumBins(Number(e.target.value))}
                      InputProps={{ inputProps: { min: 1 } }}
                    />
                  </Box>
                

                <Button variant="contained" size="small" sx={{ mt: 2 }}
                onClick={generateDualAxesBoxPlots}>
                  Generate Dual Axes Plot
                </Button>
              </AccordionDetails>
            </Accordion>


            {/* Correlation Analysis */}
            <Accordion
              expanded={expandedCard === "correlation"}
              onChange={handleAccordionChange("correlation")}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                  Correlation Analysis
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={selectedCorrColumns.length === edaColumns.length}
                        onChange={(e) =>
                          setSelectedCorrColumns(
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
                          checked={selectedCorrColumns.includes(col)}
                          onChange={(e) =>
                            setSelectedCorrColumns(
                              e.target.checked
                                ? [...selectedCorrColumns, col]
                                : selectedCorrColumns.filter((c) => c !== col)
                            )
                          }
                        />
                      }
                      label={col}
                    />
                  ))}
                </FormGroup>

                {/* Correlation method Toggle */}
                <Typography variant="subtitle1" sx={{ mt: 3, fontWeight: "bold" }}>
                  Select Correlation Methd
                </Typography>
                <RadioGroup
                  value={corrMethod}
                  onChange={(e) => setCorrMethod(e.target.value)}
                  row
                >
                  <FormControlLabel
                    value="pearson"
                    control={<Radio />}
                    label="Pearson"
                  />
                  <FormControlLabel
                    value="spearman"
                    control={<Radio />}
                    label="Spearman"
                  />
                  <FormControlLabel
                    value="kendall"
                    control={<Radio />}
                    label="Kendall"
                  />
                </RadioGroup>

                <Button variant="contained" size="small" sx={{ mt: 2 }}
                onClick={generateCorrelationAnalysis}>
                    Generate Correlation Heat Map
                </Button>
              </AccordionDetails>
            </Accordion>

            {/* Custom Continuous Range Analysis */}
            <Accordion
              expanded={expandedCard === "range"}
              onChange={handleAccordionChange("range")}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                  Custom Continuous Range Analysis
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  fullWidth
                  size="small"
                  label="Minimum duration (minutes)"
                  type="number"
                  margin="dense"
                  value={minDuration}
                  onChange={(e) => setMinDuration(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <Typography variant="body2">Thresholds for range break</Typography>
                <Grid container spacing={1} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Lower Threshold for range break (%)"
                      type="number"
                      margin="dense"
                      value={lowerPct}
                      onChange={(e) => setLowerPct(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Upper Threshold for range break (%)"
                      type="number"
                      margin="dense"
                      value={upperPct}
                      onChange={(e) => setUpperPct(e.target.value)}
                    />
                  </Grid>
                </Grid>

                <TextField
                  fullWidth
                  size="small"
                  label="Max duration of threshold breach for range break (minutes)"
                  type="number"
                  margin="dense"
                  value={maxBreak}
                  onChange={(e) => setMaxBreak(e.target.value)}
                />

                <Button variant="contained" size="small" fullWidth sx={{ mt: 2 }}
                onClick={generateContRangeAnalysis}>
                    Generate Continuous Range Analysis
                </Button>
              </AccordionDetails>
            </Accordion>

            {/* Multivariate plot Analysis */}
            <Accordion
              expanded={expandedCard === "multivariate"}
              onChange={handleAccordionChange("multivariate")}
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                  Multivariate Plot Analysis
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {/* Multi-select column list */}
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={selectedMultiColumns.length === edaColumns.length}
                        onChange={(e) => 
                          setSelectedMultiColumns(
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
                          checked={selectedMultiColumns.includes(col)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMultiColumns([...selectedMultiColumns, col]);
                            } else {
                              setSelectedMultiColumns(selectedMultiColumns.filter((c) => c !== col));
                            }
                          }
                          }
                        />
                      }
                      label={col}
                    />
                  ))}
                </FormGroup>

                {/* Plot Mode Toggle */}
                <Typography variant="subtitle1" sx={{ mt: 3, fontWeight: "bold" }}>
                  Select Plot Type for feature importance
                </Typography>
                <RadioGroup
                  value={multiMode}
                  onChange={(e) => setMultiMode (e.target.value)}
                  row
                >
                  <FormControlLabel
                    value="Boxplot"
                    control={<Radio />}
                    label="Boxplot"
                  />
                  <FormControlLabel
                    value="Timeseries"
                    control={<Radio />}
                    label="Timeseries"
                  />
                </RadioGroup>

                {/* Show input field for number of top and bottom ranges */}
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      label="Number of top vs bottom ranges"
                      type="number"
                      size="small"
                      value={numMultiRanges}
                      onChange={(e) => setnumMultiRanges(Number(e.target.value))}
                      InputProps={{ inputProps: { min: 1 } }}
                    />
                  </Box>

                <Button variant="contained" size="small" sx={{ mt: 2 }}
                  onClick={generatemultivariateanalysis}>
                  Generate Multivariate Analysis
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
      {/* Latest plots download */}
        
        <Button
          variant="contained"
          color="secondary"
          size="small"

        >
          Download Latest Plots
        </Button>
      </Box>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ flexGrow: 1, overflowY: "auto", minHeight: 400 }}>
        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}

        {edaOutput ? (
          <>
          <Plot
            data={edaOutput.data.data}
            layout={{
              ...edaOutput.data.layout,
              autosize: true,
              paper_bgcolor: theme.palette.background.paper,
              plot_bgcolor: theme.palette.background.default,
              margin: { t: 40, b: 40, l: 40, r: 40 },
            }}
            style={{ width: "100%", height: "100%", 
              minHeight: 400, minWidth: 400 
              }}
            useResizeHandler
            //config={{ responsive: true }}
          />
            
          {/* Continuous Ranges Table */}
          {edaOutput.ranges && edaOutput.ranges.length > 0 && (
            <Box mt={4} width="100%">
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: "bold", color: "primary.main" }}>
                Continuous Ranges Detected
              </Typography>
              <Paper
                sx={{
                  width: "100%",
                  p: 2,
                  bgcolor: theme.palette.background.default,
                  boxShadow: 2,
                }}
                >
              <DataGridPro
                autoHeight
                rows={edaOutput.ranges.map((r, idx) => ({
                  id: idx + 1,
                  start: new Date(r.start).toLocaleString(),
                  end: new Date(r.end).toLocaleString(),
                  duration: r.duration_min.toFixed(2),
                  start_value: r.start_value.toFixed(2),
                  lower: r.lower.toFixed(2),
                  upper: r.upper.toFixed(2),
                }))}
                columns={[
                  { field: "start", headerName: "Start", flex: 1 },
                  { field: "end", headerName: "End", flex: 1 },
                  { field: "duration", headerName: "Duration (min)", flex: 1 },
                  { field: "start_value", headerName: "Start Value", flex: 1 },
                  { field: "lower", headerName: "Lower", flex: 1 },
                  { field: "upper", headerName: "Upper", flex: 1 },
                ]}
                pageSize={5}
                rowsPerPageOptions={[5, 10]}
                disableSelectionOnClick
                sx={{
                  backgroundColor: theme.palette.background.default,
                  color: theme.palette.text.primary,
                  borderColor: theme.palette.divider,
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: theme.palette.primary.dark,
                    color: theme.palette.primary.contrastText,
                  },
                  "& .MuiDataGrid-row:hover": {
                    backgroundColor: theme.palette.action.hover,
                  },
                  "& .MuiDataGrid-footerContainer": {
                    backgroundColor: theme.palette.background.paper,
                  },
                }}
              />
              </Paper>
              </Box>
          )}
          </>
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

export default ExploratoryDataAnalysis;
