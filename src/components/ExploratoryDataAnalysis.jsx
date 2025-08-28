// src/components/ExploratoryDataAnalysis.jsx

import React, { useState, useEffect } from "react";
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
  FormGroup
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const ExploratoryDataAnalysis = ({ BACKEND_URL }) => {
  const [columns, setColumns] = useState([]);
  const [targetColumn, setTargetColumn] = useState("");
  const [expandedCard, setExpandedCard] = useState(false);
  const [selectedQcutColumn, setSelectedQcutColumn] = React.useState("");
  const [qcutQuantiles, setQcutQuantiles] = React.useState(4); // default quantiles


  // Load column names from backend
  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/get_columns`);
        const data = await res.json();
        setColumns(data.columns || []);
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

  return (
    <Grid container spacing={2}>
      {/* Left Panel */}
      <Grid item xs={4}>
        <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
          <CardContent>
            {/* Target Dropdown */}
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Target / Objective</InputLabel>
              <Select
                value={targetColumn}
                label="Target / Objective"
                onChange={(e) => setTargetColumn(e.target.value)}
              >
                {columns.map((col) => (
                  <MenuItem key={col} value={col}>
                    {col}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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
                <FormGroup>
                  {columns.map((col) => (
                    <FormControlLabel
                      key={col}
                      control={
                        <Radio 
                            size="small"
                            checked={selectedQcutColumn === col}
                            onChange={() => setSelectedQcutColumn(col)}
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
                <Button
                  variant="contained"
                  size="small"
                  sx={{ mt: 2 }}
                >
                  Generate Analysis
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
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Select two columns to compare:
                </Typography>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Column X</InputLabel>
                  <Select>
                    {columns.map((col) => (
                      <MenuItem key={col} value={col}>
                        {col}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Column Y</InputLabel>
                  <Select>
                    {columns.map((col) => (
                      <MenuItem key={col} value={col}>
                        {col}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  size="small"
                >
                  Run Dual Axes Plot
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
                <Button variant="contained" size="small">
                  Run Correlation Analysis
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
                  label="Enter Range (e.g., 10-20)"
                />
                <Button
                  variant="contained"
                  size="small"
                  sx={{ mt: 2 }}
                >
                  Run Range Analysis
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
                <Button variant="contained" size="small">
                  Run Multivariate Analysis
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
            <Typography
              variant="h6"
              gutterBottom
              color="primary"
            >
              EDA Output
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ flexGrow: 1, overflowY: "auto", minHeight: 0 }}>
              <Typography variant="body2" color="text.secondary">
                No analysis results yet.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ExploratoryDataAnalysis;
