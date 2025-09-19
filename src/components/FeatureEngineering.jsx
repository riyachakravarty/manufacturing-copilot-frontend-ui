// src/components/ExploratoryDataAnalysis.jsx

import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import axios from "axios";
import {
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

  const formula = `
  ${featureInputs.beforeCol1}(${selected1})
  ${featureInputs.op12 ? " " + featureInputs.op12 + " " : ""}
  ${featureInputs.between1and2 ? featureInputs.between1and2 : ""}${selected2 || ""}
  ${featureInputs.op23 ? " " + featureInputs.op23 + " " : ""}
  ${featureInputs.between2and3 ? featureInputs.between2and3 : ""}${selected3 || ""}
`;

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
    formula += featureInputs.between1and2
      ? `${featureInputs.between1and2}${selected2}`
      : selected2;
  }

  if (selected3) {
    formula += featureInputs.op23 ? ` ${featureInputs.op23} ` : "";
    formula += featureInputs.between2and3
      ? `${featureInputs.between2and3}${selected3}`
      : selected3;
  }

  setFinalFormula(formula.trim());
}, [selected1, selected2, selected3, featureInputs]);


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
                        value={featureInputs.op12}
                        onChange={(e) =>
                          setFeatureInputs((prev) => ({ ...prev, op12: e.target.value }))
                        }
                      />
                      <TextField
                          placeholder="Enter operator between Column 1 & 2"
                          size="small"
                          value={featureInputs.between1and2}
                          onChange={(e) =>
                            setFeatureInputs((prev) => ({ ...prev, between1and2: e.target.value }))
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
                          value={featureInputs.op23}
                          onChange={(e) =>
                            setFeatureInputs((prev) => ({ ...prev, op23: e.target.value }))
                          }
                        />
                          <TextField
                          placeholder="Enter operator between Column 2 & 3"
                          size="small"
                          value={featureInputs.between2and3}
                          onChange={(e) =>
                            setFeatureInputs((prev) => ({ ...prev, between2and3: e.target.value }))
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

                {finalFormula && (
                <Box sx={{ mt: 2, p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    Preview Formula:
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: "monospace", mt: 1 }}>
                    {finalFormula}
                  </Typography>
                </Box>
              )}
                
                <Button variant="contained" size="small" sx={{ mt: 2 }}>
                  Generate Custom Feature
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

export default FeatureEngineering;
