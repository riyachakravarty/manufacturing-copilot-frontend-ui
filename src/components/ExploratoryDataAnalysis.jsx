// src/components/ExploratoryDataAnalysis.jsx

import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import {
  Box,
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const BACKEND_URL = "https://manufacturing-copilot-backend.onrender.com";

const ExploratoryDataAnalysis = () => {
  const [edaColumns, setEdaColumns] = useState([]);
  const [targetColumn, setTargetColumn] = useState("");
  const [edaOutput, setEdaOutput] = useState(null);
  const [performanceDirection, setPerformanceDirection] = useState("higher");
  const [expandedCard, setExpandedCard] = useState(false);

  // Q-cut state
  const [selectedQcutColumns, setSelectedQcutColumns] = useState([]);
  const [qcutQuantiles, setQcutQuantiles] = useState(4);
  

  // Dual Axes Box Plots
  const [dualAxisX, setDualAxisX] = useState("");
  const [dualAxisY, setDualAxisY] = useState("");
  const [dualAxisQuantiles, setDualAxisQuantiles] = useState(4);

  // Correlation
  const [selectedCorrColumns, setSelectedCorrColumns] = useState([]);
  const [corrMethod, setCorrMethod] = useState("pearson");

  // Continuous Range Analysis
  const [minRangeDuration, setMinRangeDuration] = useState("");
  const [spikeMin, setSpikeMin] = useState("");
  const [spikeMax, setSpikeMax] = useState("");
  const [minSpikeDuration, setMinSpikeDuration] = useState("");

  // Multivariate Analysis
  const [selectedMultiColumns, setSelectedMultiColumns] = useState([]);
  const [multiMode, setMultiMode] = useState("continuous");

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

  // Card toggle
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedCard(isExpanded ? panel : false);
  };

  // Function to call backend and fetch Q-cut box plots
const generateQcutBoxPlots = async () => {
  try {
    if (!targetColumn || selectedQcutColumns.length === 0) {
      console.error("Target or columns not selected for Q-cut analysis");
      return;
    }

    const res = await fetch(`${BACKEND_URL}/eda/qcut_boxplot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target: targetColumn,
        quantiles: parseInt(qcutQuantiles, 10),
        columns: selectedQcutColumns,
    })
  })

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Backend error:", errorText);
      return;
    }

    const data = await res.json();
    console.log("Q-cut plot response:", data);

    // 🔑 Example: if backend returns {"type": "plot", "data": ...}
    if (data.type === "plot") {
      // TODO: Replace with state that renders in right panel
      setEdaOutput(data.data);
    }
  } catch (err) {
    console.error("Error generating Q-cut box plots:", err);
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
                  {edaColumns.map((col) => (
                    <FormControlLabel
                      key={col}
                      control={
                        <Checkbox
                          size="small"
                          checked={selectedQcutColumns.includes(col)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedQcutColumns([...selectedQcutColumns, col]);
                            } else {
                              setSelectedQcutColumns(selectedQcutColumns.filter((c) => c !== col));
                            }
                          }}
                        />
                      }
                      label={col}
                      sx={{ fontSize: "0.85rem" }}
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
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Column X</InputLabel>
                  <Select
                    value={dualAxisX}
                    onChange={(e) => setDualAxisX(e.target.value)}
                  >
                    {edaColumns.map((col) => (
                      <MenuItem key={col} value={col}>
                        {col}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Column Y</InputLabel>
                  <Select
                    value={dualAxisY}
                    onChange={(e) => setDualAxisY(e.target.value)}
                  >
                    {edaColumns.map((col) => (
                      <MenuItem key={col} value={col}>
                        {col}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  size="small"
                  label="Number of quantiles for Column X"
                  type="number"
                  value={dualAxisQuantiles}
                  onChange={(e) => setDualAxisQuantiles(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <Button variant="contained" size="small">
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

                <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                  <InputLabel>Correlation Method</InputLabel>
                  <Select
                    value={corrMethod}
                    onChange={(e) => setCorrMethod(e.target.value)}
                  >
                    <MenuItem value="pearson">Pearson</MenuItem>
                    <MenuItem value="spearman">Spearman</MenuItem>
                    <MenuItem value="kendall">Kendall</MenuItem>
                  </Select>
                </FormControl>

                <Button variant="contained" size="small" sx={{ mt: 2 }}>
                  Generate Correlation Analysis
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
                  label="Minimum duration of continuous range"
                  value={minRangeDuration}
                  onChange={(e) => setMinRangeDuration(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <Typography variant="body2">Threshold of spike for range break</Typography>
                <Grid container spacing={1} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Min"
                      value={spikeMin}
                      onChange={(e) => setSpikeMin(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Max"
                      value={spikeMax}
                      onChange={(e) => setSpikeMax(e.target.value)}
                    />
                  </Grid>
                </Grid>

                <TextField
                  fullWidth
                  size="small"
                  label="Minimum duration of spike for range break"
                  value={minSpikeDuration}
                  onChange={(e) => setMinSpikeDuration(e.target.value)}
                />

                <Button variant="contained" size="small" sx={{ mt: 2 }}>
                  Generate Range Analysis
                </Button>
              </AccordionDetails>
            </Accordion>

            {/* Multivariate Timeseries Analysis */}
            <Accordion
              expanded={expandedCard === "multivariate"}
              onChange={handleAccordionChange("multivariate")}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                  Multivariate Timeseries Analysis
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormGroup>
                  {edaColumns.map((col) => (
                    <FormControlLabel
                      key={col}
                      control={
                        <Checkbox
                          checked={selectedMultiColumns.includes(col)}
                          onChange={(e) =>
                            setSelectedMultiColumns(
                              e.target.checked
                                ? [...selectedMultiColumns, col]
                                : selectedMultiColumns.filter((c) => c !== col)
                            )
                          }
                        />
                      }
                      label={col}
                    />
                  ))}
                </FormGroup>

                <ToggleButtonGroup
                  value={multiMode}
                  exclusive
                  onChange={(e, val) => val && setMultiMode(val)}
                  size="small"
                  sx={{ mt: 2 }}
                >
                  <ToggleButton value="continuous">Continuous ranges</ToggleButton>
                  <ToggleButton value="all">All timestamps</ToggleButton>
                </ToggleButtonGroup>

                <Button variant="contained" size="small" sx={{ mt: 2 }}>
                  Generate Multivariate Analysis
                </Button>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>
      </Grid>

      {/* Right Panel */}
<Grid item xs={8}>
  <Card sx={{ borderRadius: 3, boxShadow: 2, height: "100%" }}>
    <CardContent>
      <Typography variant="h6" gutterBottom color="primary">
        EDA Output
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ flexGrow: 1, overflowY: "auto", minHeight: 0 }}>
        {edaOutput ? (
          <Plot
            data={edaOutput.data}
            layout={edaOutput.layout}
            style={{ width: "100%", height: "100%" }}
            config={{ responsive: true }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            No analysis results yet.
          </Typography>
        )}
      </Box>
    </CardContent>
  </Card>
</Grid>

    </Grid>
  );
};

export default ExploratoryDataAnalysis;
