// src/components/DataVisualizationAndEngineering.jsx
//import React, { useState, useContext, useEffect } from "react";
import React, { useState, useEffect, useContext } from "react";
import { PlotContext } from "../context/PlotContext";

import Plot from "react-plotly.js";
import { AppContext } from "../context/AppContext";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Card,
  CardContent,
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
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer
  //FormControl,
  //InputLabel
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTheme } from "@mui/material/styles";

const BACKEND_URL = "https://manufacturing-copilot-backend.onrender.com";

export default function DataVisualizationAndEngineering() {
  //const { uploadedFile } = useContext(AppContext);
  const theme = useTheme();
  const {targetColumn} = useContext(AppContext);

  const [expanded, setExpanded] = useState("variability");
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);

  //const [plotData, setPlotData] = useState(null);
  const { lastPlot, setLastPlot } = useContext(PlotContext);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Other UI states
  const [missingValueColumn, setMissingValueColumn] = useState("");
  const [treatmentMode, setTreatmentMode] = useState("datetime");
  const [outlierColumn, setOutlierColumn] = useState("");
  const [outlierMethod, setOutlierMethod] = useState("zscore");
  const [missingDiagnostics, setMissingDiagnostics] = useState(null);
  const [variabilitySummary, setVariabilitySummary] = useState(null);
  //const [outlierPlot, setOutlierPlot] = useState(null);

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
  const [outlierColumns, setOutlierColumns] = useState([]);
  const [outlierSelectedColumns, setOutlierSelectedColumns] = useState("");
  const [outlierIntervals, setOutlierIntervals] = useState([]);
  const [outlierSelectedIntervals, setOutlierSelectedIntervals] = useState([]);
  const [outlierTreatmentMethod, setOutlierTreatmentMethod] = useState("Mean");

  // Missing value in column treatment mode 
  const [missingValueColumns, setMissingValueColumns] = useState([]);
  const [selectedMissingValueColumn, setSelectedMissingValueColumn] = useState("");
  const [missingValueIntervals, setMissingValueIntervals] = useState([]);
  const [selectedMissingValueIntervals, setSelectedMissingValueIntervals] = useState([]);
  const [missingValueTreatmentMethod, setMissingValueTreatmentMethod] = useState("Mean");

  
    // Select All states
  const [selectAllColumns, setSelectAllColumns] = useState(false);
  const [selectAllDateTimeIntervals, setSelectAllDateTimeIntervals] = useState(false);
  const [selectAllMissingValueIntervals, setSelectAllMissingValueIntervals] = useState(false);
  const [selectAllOutlierIntervals, setSelectAllOutlierIntervals] = useState(false);

  //Decision summary
  const [readinessData, setReadinessData] = useState(null);
  const [readinessLoading, setReadinessLoading] = useState(false);
  const [readinessError, setReadinessError] = useState(null);
  

  // Handlers for "Select All" checkboxes

  // For Columns in Missing Date Times
  const handleSelectAllColumns = (e) => {
    const checked = e.target.checked;
    setSelectAllColumns(checked);
    if (checked) {
      setTreatmentSelectedColumns([...columns]);
    } else {
      setTreatmentSelectedColumns([]);
    }
  };

  // For Intervals in Missing Date Times
  const handleSelectAllDateTimeIntervals = (e) => {
    const checked = e.target.checked;
    setSelectAllDateTimeIntervals(checked);
    if (checked) {
      setTreatmentSelectedIntervals([...missingDateTimeIntervals]);
    } else {
      setTreatmentSelectedIntervals([]);
    }
  };

  // For Intervals in Missing Values in Column
  const handleSelectAllMissingValueIntervals = (e) => {
    const checked = e.target.checked;
    setSelectAllMissingValueIntervals(checked);
    if (checked) {
      setSelectedMissingValueIntervals([...missingValueIntervals]);
    } else {
      setSelectedMissingValueIntervals([]);
    }
  };

  // For Outlier Intervals in Column
  const handleSelectAllOutlierIntervals = (e) => {
    const checked = e.target.checked;
    setSelectAllOutlierIntervals(checked);
    if (checked) {
      setSelectAllOutlierIntervals([...outlierIntervals]);
    } else {
      setSelectAllOutlierIntervals([]);
    }
  };

  // Individual interval toggle for "Missing Values in Column"
  const handleMissingValueIntervalToggle = (interval) => {
    const exists = selectedMissingValueIntervals.some(
      (i) => i.start === interval.start && i.end === interval.end
    );
    if (exists) {
      setSelectedMissingValueIntervals((prev) =>
        prev.filter((i) => !(i.start === interval.start && i.end === interval.end))
      );
    } else {
      setSelectedMissingValueIntervals((prev) => [...prev, interval]);
    }
  };


  //Post treatment output panel
  // To trigger the popup after treatment
  const [showPostTreatmentPrompt, setShowPostTreatmentPrompt] = useState(false);

  // Column selection for updated missing value plot
  const [postTreatmentSelectedColumn, setPostTreatmentSelectedColumn] = useState("");

  // Data for updated missing value plot
  //const [postTreatmentPlotData, setPostTreatmentPlotData] = useState(null);

  // To store latest augmented dataframe for download
  const [latestAugmentedDf, setLatestAugmentedDf] = useState(null);

  const [postTreatmentColumns, setPostTreatmentColumns] = useState([]);

  const [postTreatmentMode, setPostTreatmentMode] = useState("missing"); // "missing" | "outlier"


  useEffect(() => {
    // Fetch columns on mount
    const fetchColumns = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/get_columns`);
        if (!response.ok) throw new Error("Failed to fetch columns");
        const data = await response.json();
        if (data.columns) {
          setColumns(data.columns);
          setOutlierColumns(data.columns)
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
    //setPlotData(null);
    setLastPlot(null);
  };

  // Auto-load columns when "Missing Values in Column" mode is selected
  useEffect(() => {
    if (expanded === "missingTreatment" && treatmentMode === "column") {
      const fetchColumns = async () => {
        try {
          const res = await fetch(`${BACKEND_URL}/get_columns`);
          if (!res.ok) throw new Error("Failed to fetch columns");
          const data = await res.json();
          if (data.columns) {
            setMissingValueColumns(data.columns);
          }
        } catch (err) {
          console.error("Error loading columns:", err);
          setError("Error loading columns for Missing Values in Column mode");
        }
      };
      fetchColumns();
    }
  }, [expanded, treatmentMode]);

  // Auto-load missing intervals when a column is selected
  useEffect(() => {
    if (selectedMissingValueColumn) {
      const fetchIntervals = async () => {
        try {
          const res = await fetch(
            `${BACKEND_URL}/missing_value_intervals?column=${selectedMissingValueColumn}`
          );
          if (!res.ok) throw new Error("Failed to fetch missing value intervals");
          const data = await res.json();
          if (data.intervals) {
            setMissingValueIntervals(data.intervals);
          }
        } catch (err) {
          console.error("Error loading missing value intervals:", err);
          setMissingValueIntervals([]);
        }
      };
      fetchIntervals();
    } else {
      setMissingValueIntervals([]);
      setSelectedMissingValueIntervals([]);
    }
  }, [selectedMissingValueColumn]);

  // Auto-load outlier intervals when a column is selected
  useEffect(() => {
    if (outlierSelectedColumns && outlierMethod) {
      const fetchIntervals = async () => {
        try {
          const res = await fetch(
            `${BACKEND_URL}/outlier_intervals?column=${encodeURIComponent(outlierSelectedColumns)}&method=${encodeURIComponent(outlierMethod)}`
          );
          if (!res.ok) throw new Error("Failed to fetch outlier intervals");
          const data = await res.json();
          if (data.intervals) {
            setOutlierIntervals(data.intervals || []);
          }
        } catch (err) {
          console.error("Error loading outlier intervals:", err);
          setOutlierIntervals([]);
        }
      };
      fetchIntervals();
    } else {
      setOutlierIntervals([]);
      setOutlierSelectedIntervals([]);
    }
  }, [outlierSelectedColumns,outlierMethod]);

  // Toggle for interval checkboxes in "Missing Values in Column" mode
  //const handleMissingValueIntervalToggle = (interval) => {
    //setSelectedMissingValueIntervals((prev) => {
      //const exists = prev.find(
        //(i) => i.start === interval.start && i.end === interval.end
      //);
      //if (exists) {
        //return prev.filter(
         // (i) => !(i.start === interval.start && i.end === interval.end)
        //);
      //} else {
        //return [...prev, interval];
      //}
    //});
  //};

//Decision summary
  useEffect(() => {
    if (!targetColumn) return;
  
    const fetchReadiness = async () => {
      try {
        setReadinessLoading(true);
        setReadinessError(null);
  
        const response = await fetch(
          `${BACKEND_URL}/data/readiness_summary`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              target: targetColumn
            })
          }
        );
  
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch readiness summary");
        }
  
        setReadinessData(data);
  
      } catch (err) {
        console.error(err);
        setReadinessError(err.message);
      } finally {
        setReadinessLoading(false);
      }
    };
  
    fetchReadiness();
  
  }, [targetColumn]);
  

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
    //setPlotData(null);
    setLastPlot(null);
    setVariabilitySummary(null);
    try {
      const response = await fetch(`${BACKEND_URL}/data/variability_analysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          variable: selectedColumns
        })
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to run variability analysis");
  
      
      setLastPlot(data.plot);
      setVariabilitySummary(data.variability_summary);
        
      
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
    //setPlotData(null);
    setLastPlot(null);
    setMissingDiagnostics(null);

    try {
      const response = await fetch(`${BACKEND_URL}/data/missing_analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variable: missingValueColumn,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) throw new Error(data.error || "Failed to run missing analysis");

      setLastPlot(data.plot);
      setMissingDiagnostics({
        missing_datetime: data.missing_datetime,
        missing_values: data.missing_values,
      });
        
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
        //setPlotData(result.data);   // Same as missing value analysis
        setLastPlot(result.data);
        
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

  //const handleOutlierColumnToggle = (col) => {
    //setOutlierSelectedColumns((prev) =>
      //prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    //);
  //};

  // Individual interval toggle for Outliers
  const handleOutlierIntervalToggle = (interval) => {
    const exists = outlierSelectedIntervals.some(
      (i) => i.start === interval.start && i.end === interval.end
    );
    if (exists) {
      setOutlierSelectedIntervals((prev) =>
        prev.filter((i) => !(i.start === interval.start && i.end === interval.end))
      );
    } else {
      setOutlierSelectedIntervals((prev) => [...prev, interval]);
    }
  };

    // Load columns for Missing Values mode
  //const loadMissingValueColumns = async () => {
    //try {
      //const res = await fetch(`${BACKEND_URL}/get_columns`);
      //const data = await res.json();
      //setMissingValueColumns(data.columns || []);
    //} catch (err) {
      //console.error("Error loading missing value columns:", err);
    //}
  //};

  // Load missing value intervals for selected column [NOT NEEDED AS USE EFFECT EXISTS]
  //const loadMissingValueIntervals = async () => {
    //if (!selectedMissingValueColumn) {
      //alert("Please select a column first");
      //return;
    //}
    //try {
      //const res = await fetch(`${BACKEND_URL}/missing_value_intervals?column=${encodeURIComponent(selectedMissingValueColumn)}`);
      //const data = await res.json();
      //setMissingValueIntervals(data.intervals || []);
    //} catch (err) {
      //console.error("Error loading missing value intervals:", err);
    //}
  //};

    // Load outlier intervals for selected column
  //const loadOutlierIntervals = async () => {
    //if (!outlierSelectedColumns) {
      //alert("Please select a column first");
      //return;
    //}
    //try {
      //const res = await fetch(`${BACKEND_URL}/outlier_intervals?column=${encodeURIComponent(outlierSelectedColumns)}`);
      //const data = await res.json();
      //setOutlierIntervals(data.intervals || []);
    //} catch (err) {
      //console.error("Error loading outlier intervals:", err);
    //}
  //};

  //Function to trigger post-treatment prompt
  const handlePostTreatmentFlow = (backendResponse) => {
  if (!backendResponse || !backendResponse.columns) {
    setError("No column data returned from backend.");
    return;
  }

  // Set columns for post-treatment selection
  setPostTreatmentColumns(backendResponse.columns);

  // Show pop-up prompt
  setShowPostTreatmentPrompt(true);
};

//Handler for user selection in pop-up
  const handlePostTreatmentPromptAnswer = (answer) => {
    setShowPostTreatmentPrompt(false);

    if (answer === "yes") {
      // Optionally, clear previous selection & plot
      setPostTreatmentSelectedColumn("");
      //setPostTreatmentPlotData(null);
    }
  };

  //Handler to load missing value plot for selected column
  const loadPostTreatmentMissingValuePlot = async () => {
  if (!postTreatmentSelectedColumn) {
      setError("Please select a column for analysis.");
      return;
    }

    try {
      const prompt = `Post treatment missing value plot where selected variable is ${postTreatmentSelectedColumn}`;
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const result = await response.json();

      if (result.type === "plot" && result.data) {
        //setPlotData(result.data);
        setLastPlot(result.data);
        
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

  //Handler to load missing value plot for selected column
  const loadPostTreatmentOutlierPlot = async () => {
  if (!postTreatmentSelectedColumn) {
      setError("Please select a column for analysis.");
      return;
    }

    try {
      const prompt = `outlier analysis where selected variable is ${postTreatmentSelectedColumn}`;
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const result = await response.json();

      if (result.type === "plot" && result.data) {
        //setPlotData(result.data);
        setLastPlot(result.data);
        
        setExpanded(false); // Collapse left accordion to free space
      } else {
        setError("Unexpected response from server.");
      }
    } catch (err) {
      console.error(err);
      setError("Error running outlier analysis.");
    } finally {
      setLoading(false);
    }
  };


  // Apply missing value treatment
  const applyMissingValueTreatment = async () => {
    let endpoint = "";
    let payload = {};

    try {
      if (treatmentMode === "datetime") {
        // Missing Date Times mode
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

        payload = {
          columns: treatmentSelectedColumns,
          intervals: treatmentSelectedIntervals,
          method: treatmentMethod,
        };
        endpoint = `${BACKEND_URL}/apply_treatment`;

      } else if (treatmentMode === "column") {
        // Missing Values in Column mode
        if (!selectedMissingValueColumn) {
          alert("Please select a column.");
          return;
        }
        if (!selectedMissingValueIntervals.length) {
          alert("Please select at least one missing value interval.");
          return;
        }
        if (!treatmentMethod) {
          alert("Please select a treatment method.");
          return;
        }

        payload = {
          column: selectedMissingValueColumn,
          intervals: selectedMissingValueIntervals,
          method: treatmentMethod,
        };
        endpoint = `${BACKEND_URL}/apply_missing_value_treatment`;

      } else {
        alert("Invalid treatment mode selected.");
        return;
      }

      // Make API request
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error applying treatment: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("API returned:", data);
      alert(data.message || "Treatment applied successfully!");
      console.log("Treatment response:", data);

      // Optionally reset selections
      if (treatmentMode === "datetime") {
        setTreatmentSelectedColumns([]);
        setTreatmentSelectedIntervals([]);
      } else if (treatmentMode === "column") {
        setSelectedMissingValueColumn("");
        setSelectedMissingValueIntervals([]);
      }

      // Trigger post-treatment prompt
      setPostTreatmentMode("missing");
      handlePostTreatmentFlow(data);
      setLatestAugmentedDf(data);

    } catch (error) {
      console.error("Error applying missing value treatment:", error);
      setError("Error applying missing value treatment: " + error.message);
    } finally {
      setLoadingTreatment(false);
    }
  };

// Apply outlier treatment
  const applyOutlierTreatment = async () => {
    let endpoint = "";
    let payload = {};

    try {
        if (!outlierSelectedColumns) {
          alert("Please select a column.");
          return;
        }
        if (!outlierSelectedIntervals.length) {
          alert("Please select at least one outlier interval.");
          return;
        }
        if (!treatmentMethod) {
          alert("Please select a treatment method.");
          return;
        }

        payload = {
          column: outlierSelectedColumns,
          intervals: outlierSelectedIntervals,
          method: outlierTreatmentMethod,
        };
        endpoint = `${BACKEND_URL}/apply_outlier_treatment`;

      // Make API request
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

      if (!response.ok) {
        throw new Error(`Error applying treatment: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("API returned:", data);
      alert(data.message || "Treatment applied successfully!");
      console.log("Treatment response:", data);

      // Trigger post-treatment prompt
      setPostTreatmentMode("outlier");
      handlePostTreatmentFlow(data);
      setLatestAugmentedDf(data);

    } catch (error) {
      console.error("Error applying outlier treatment:", error);
      setError("Error applying outlier treatment: " + error.message);
    } finally {
      setLoadingTreatment(false);
    }
  };

  return (
    <Grid container spacing={2} wrap="nowrap" sx={{ 
      //minHeight: 0, 
      height: "100%" }}>
    {/* Left Panel */}
    <Grid item 
      //xs={2}
      //md={2}
      sx={{
        flex: "0 0 20%",   // Left fixed 20%
        maxWidth: "20%",
      minWidth: 260,
        //height: "100%",
        //display: "flex",
        //flexDirection: "column",
        //px: 1,
        fontSize: "0.85rem",
        //flexShrink: 0,
        //minWidth: 320,
        //transition: "width 0.3s ease",
        //width: 320, // fixed like DVE
        //minHeight: 0,
        overflowY: "auto"
}}>
        <Card
        sx={{
          borderRadius: 3,
          boxShadow: 2,
          //flexGrow: 1,
          //display: "flex",
          //flexDirection: "column",
          height: "100%"
        }}
      >
      <CardContent
        sx={{
          height: "100%",
          //flexGrow: 1,
          overflowY: "auto",
          //minHeight: 0,
        }}
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
                Run Variability Analysis
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
                Run Missing Value Analysis
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
        {/* Columns List with Select All */}
        <Grid
          item
          xs={4}
          sx={{ maxHeight: 200, overflowY: "auto", borderRight: "1px solid #ccc", pr: 1 }}
        >
          <Typography variant="caption" sx={{ fontWeight: "bold" }}>
            Columns
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox size="small" checked={selectAllColumns} onChange={handleSelectAllColumns} />
              }
              label="Select All"
              sx={{ fontSize: "0.85rem" }}
            />
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

        {/* Intervals List with Select All */}
        <Grid
          item
          xs={4}
          sx={{ maxHeight: 200, overflowY: "auto", borderRight: "1px solid #ccc", pl: 1 }}
        >
          <Typography variant="caption" sx={{ fontWeight: "bold" }}>
            Intervals
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={selectAllDateTimeIntervals}
                  onChange={handleSelectAllDateTimeIntervals}
                />
              }
              label="Select All"
              sx={{ fontSize: "0.85rem" }}
            />
            {missingDateTimeIntervals.length > 0 ? (
              missingDateTimeIntervals.map((interval) => {
                const checked = treatmentSelectedIntervals.some(
                  (i) => i.start === interval.start && i.end === interval.end
                );
                return (
                  <FormControlLabel
                    key={`${interval.start}-${interval.end}`}
                    control={
                      <Checkbox
                        size="small"
                        checked={checked}
                        onChange={() => handleTreatmentIntervalToggle(interval)}
                      />
                    }
                    label={`${interval.start} → ${interval.end}`}
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
      <Grid container spacing={2}>
        {/* Columns Radio List */}
        <Grid
          item
          xs={6}
          sx={{ maxHeight: 150, overflowY: "auto", borderRight: "1px solid #ccc", pr: 1 }}
        >
          <Typography variant="caption" sx={{ fontWeight: "bold" }}>
            Columns
          </Typography>
          <FormGroup>
            {missingValueColumns.map((col) => (
              <FormControlLabel
                key={col}
                control={
                  <Radio
                    size="small"
                    checked={selectedMissingValueColumn === col}
                    onChange={() => setSelectedMissingValueColumn(col)}
                  />
                }
                label={col}
                sx={{ fontSize: "0.85rem" }}
              />
            ))}
          </FormGroup>
        </Grid>

        {/* Intervals List with Select All */}
        <Grid
          item
          xs={6}
          sx={{ maxHeight: 200, overflowY: "auto", borderRight: "1px solid #ccc", pr: 1 }}
        >
          <Typography variant="caption" sx={{ fontWeight: "bold" }}>
            Missing Value Intervals
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={selectAllMissingValueIntervals}
                  onChange={handleSelectAllMissingValueIntervals}
                />
              }
              label="Select All"
              sx={{ fontSize: "0.85rem" }}
            />
            {missingValueIntervals.length > 0 ? (
              missingValueIntervals.map((interval, idx) => (
                <FormControlLabel
                  key={`${interval.start}-${interval.end}`}
                  control={
                    <Checkbox
                      size="small"
                      checked={selectedMissingValueIntervals.some(
                        (i) => i.start === interval.start && i.end === interval.end
                      )}
                      onChange={() => handleMissingValueIntervalToggle(interval)}
                    />
                  }
                  label={`${interval.start} → ${interval.end}`}
                  sx={{ fontSize: "0.85rem" }}
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                No missing value intervals found.
              </Typography>
            )}
          </FormGroup>
        </Grid>

        {/* Treatment Method */}
        <Grid item xs={12}>
          <Typography variant="caption" sx={{ fontWeight: "bold" }}>
            Treatment Method
          </Typography>
          <Select
            size="small"
            value={missingValueTreatmentMethod}
            onChange={(e) => setMissingValueTreatmentMethod(e.target.value)}
            fullWidth
            sx={{ mt: 1 }}
          >
            <MenuItem value="Forward fill">Forward Fill</MenuItem>
            <MenuItem value="Backward fill">Backward Fill</MenuItem>
            <MenuItem value="Mean">Mean</MenuItem>
            <MenuItem value="Median">Median</MenuItem>
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
                  xs={6}
                  sx={{ maxHeight: 150, overflowY: "auto", borderRight: "1px solid #ccc", pr: 1 }}
                >
                  <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                    Columns
                  </Typography>
                  <FormGroup>
                    {outlierColumns.map((col) => (
                      <FormControlLabel
                        key={col}
                        control={
                          <Radio
                            size="small"
                            checked={outlierSelectedColumns === col}
                            onChange={() => setOutlierSelectedColumns(col)}
                          />
                        }
                        label={col}
                        sx={{ fontSize: "0.85rem" }}
                      />
                      ))}
                  </FormGroup>
                </Grid>

                <Typography variant="caption" sx={{ fontWeight: "bold", mt: 2 }}>
                  Outlier Detection Method
                </Typography>
                <RadioGroup
                  value={outlierMethod}
                  onChange={(e) => setOutlierMethod(e.target.value)}
                >
                  <FormControlLabel
                    value="zscore"
                    control={<Radio size="small" />}
                    label="Z-Score"
                  />
                  <FormControlLabel
                    value="iqr"
                    control={<Radio size="small" />}
                    label="IQR"
                  />
                </RadioGroup>


                {/* Interval List */}
                <Grid
                  item
                  xs={6}
                  sx={{
                    maxHeight: 200,
                    overflowY: "auto",
                    borderRight: "1px solid #ccc",
                    pr: 1,
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                    Outlier Intervals
                  </Typography>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={selectAllOutlierIntervals}
                          onChange={handleSelectAllOutlierIntervals}
                        />
                      }
                      label="Select All"
                      sx={{ fontSize: "0.85rem" }}
                    />
                    {outlierIntervals.length > 0 ? (
                      outlierIntervals.map((interval, idx) => (
                        <FormControlLabel
                          key={`${interval.start}-${interval.end}`}
                          control={
                            <Checkbox
                              size="small"
                              checked={outlierSelectedIntervals.some(
                                (i) => i.start === interval.start && i.end === interval.end
                              )}
                            onChange={() => handleOutlierIntervalToggle(interval)}
                          />
                        }
                        label={`${interval.start} → ${interval.end}`}
                        sx={{ fontSize: "0.85rem" }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      No Outlier intervals found.
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
          </CardContent>
        </Card>
      </Grid>

      {/* RIGHT PANEL */}
      
      <Grid
  item
  //xs={6}
  //md={6}
  sx={{
    flex: "1 1 50%",   // Middle flexible
    //border: "2px solid red",
    //height: "100%",
    //display: "flex",
    //flexDirection: "column",
    minWidth: 0,
    //minHeight: 0,
    //flexShrink: 1,          // allow growth
   //flexGrow: 1,
   minHeight: 0,
   overflowY: "auto",
    //overflowX: "hidden",
  }}
>
  <Paper
    sx={{
      p: 2,
      height: "100%",
      //display: "flex",
      //flexDirection: "column",
      bgcolor: theme.palette.background.paper,
    }}
    elevation={3}
  >
    <Box sx={{ display: "flex", justifyContent: "space-between",alignItems: "center", mb: 2, flexShrink: 0 }}>
      <Typography variant="h6" gutterBottom color="primary">
        Analysis Output
      </Typography>

      {/* Latest Augmented Data Download */}
      {latestAugmentedDf && (    
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
        )}
</Box>
    <Divider sx={{ mb: 2 }} />

    {/* ================= DECISION LAYER ================= */}

    <Box
  sx={{
    position: "sticky",
    top: 0,
    zIndex: 10,
    bgcolor: "background.paper",
    pb: 2,
  }}
>

  {/* Recommendation Card */}
  <Card
  sx={{
    mb: 2,
    borderLeft: `6px solid ${
      readinessData?.recommendations?.final_status === "red"
        ? "#d32f2f"
        : readinessData?.recommendations?.final_status === "yellow"
        ? "#ed6c02"
        : "#2e7d32"
    }`
  }}
>
  <CardContent>
    <Typography variant="h6" color="success.main" gutterBottom>
      Recommendations
    </Typography>


    {readinessLoading && <CircularProgress size={24} />}

    {readinessError && (
      <Typography color="error">{readinessError}</Typography>
    )}

    {readinessData && (
      <>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Final Status:{" "}
          <strong style={{ textTransform: "capitalize" }}>
            {readinessData.recommendations.final_status}
          </strong>
        </Typography>

        {/* Target Actions */}
        <Typography variant="subtitle2" sx={{ mt: 2 }}>
          Target Actions
        </Typography>

        {readinessData.recommendations.target.actions.map((item, index) => (
          <Typography key={index} variant="body2" sx={{ mb: 1 }}>
            • {item.action}
          </Typography>
        ))}

        {/* Feature Actions */}
        <Typography variant="subtitle2" sx={{ mt: 2 }}>
          Feature Actions
        </Typography>

        {readinessData.recommendations.features.actions.map((item, index) => (
          <Typography key={index} variant="body2" sx={{ mb: 1 }}>
            • <strong>{item.feature}:</strong>{" "}
            {item.actions.join(" ")}
          </Typography>
        ))}
      </>
    )}

  </CardContent>
</Card>

  {/* Supporting Evidence */}
  <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" color="primary" gutterBottom>
            Supporting Evidence
          </Typography>

          {readinessData && (
      <>
        {/* Target Observation */}
        <Typography variant="subtitle2" sx={{ mt: 1 }}>
          Target Observations
        </Typography>

        <Typography variant="body2" sx={{ mb: 2 }}>
          {readinessData.observations.target}
        </Typography>

        {/* Feature Observations */}
        <Typography variant="subtitle2">
          Feature Observations
        </Typography>

        {readinessData.observations.features.map((item, index) => (
          <Typography key={index} variant="body2" sx={{ mb: 1 }}>
            • <strong>{item.feature}:</strong> {item.observation}
          </Typography>
        ))}
      </>
    )}

        </CardContent>
      </Card>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: "auto", minHeight: 0 }}>
        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}

        {/*{plotData ? (*/}
        {lastPlot ? (
          <Plot
            data={lastPlot.data}
            layout={{
              ...lastPlot.layout,
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


      {/* Post-Treatment Prompt Dialog */}
      <Dialog open={showPostTreatmentPrompt} onClose={() => setShowPostTreatmentPrompt(false)}>
        <DialogTitle>View Updated Plot post treatment?</DialogTitle>
        <DialogContent>
          <Typography>
            Do you want to select a column and view updated plot?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handlePostTreatmentPromptAnswer("no")}>No</Button>
          <Button onClick={() => handlePostTreatmentPromptAnswer("yes")} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Post-Treatment Column Selection & Plot */}
      {postTreatmentColumns?.length > 0 && (
      //{postTreatmentColumns?.length > 0 && postTreatmentSelectedColumn !== null && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
            {postTreatmentMode === "missing"
              ? "Select Column for Updated Missing Value Plot"
              : "Select Column for Updated Outlier Plot"}
          </Typography>
          <FormGroup>
            {postTreatmentColumns.map((col) => (
              <FormControlLabel
                key={col}
                control={
                  <Radio
                    size="small"
                    checked={postTreatmentSelectedColumn === col}
                    onChange={() => setPostTreatmentSelectedColumn(col)}
                  />
                }
                label={col}
                sx={{ fontSize: "0.85rem" }}
              />
            ))}
          </FormGroup>
          <Button
            variant="contained"
            size="small"
            sx={{ mt: 1 }}
            onClick={
              postTreatmentMode === "missing"
                ? loadPostTreatmentMissingValuePlot
                : loadPostTreatmentOutlierPlot
            }
          >
            Load Updated Analysis
          </Button>
        </Box>
      )}

      
    </Box>
  </Paper>
</Grid>

{/* AI led Interpretation panel */}

<Grid
  item
  //xs={4}
  //md={4}
  sx={{
    flex: "0 0 30%",   // Right fixed 30%
    maxWidth: "30%",
      minWidth: 320,
    //height: "100%",
    //flexShrink: 0,
    //display: "flex",
    //flexDirection: "column",
    fontSize: "0.85rem",
    //width: 480,
    //minHeight: 0,
    //minWidth: 0,
    overflowY: "auto"
  }}
>
<Paper sx={{ p: 2, height: "100%", 
  //overflowY: "auto" 
  }}>
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

  {missingDiagnostics && (
  <>
    {/* =============================== */}
    {/* Missing Timestamp Card */}
    {/* =============================== */}
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight="bold" color="error">
          Missing Timestamp Gaps
        </Typography>

        <Typography variant="body2" sx={{ mt: 1 }}>
          {missingDiagnostics.missing_datetime.summary_text}
        </Typography>


        <Divider sx={{ my: 2 }} />

        {/* Table */}
        {missingDiagnostics.missing_datetime.interval_table?.length > 0 && (
          <TableContainer
            component={Paper}
            sx={{ maxHeight: 240, overflowY: "auto", borderRadius: 2 }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Start</TableCell>
                  <TableCell>End</TableCell>
                  <TableCell align="right">Duration (min)</TableCell>
                  <TableCell>Month</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {missingDiagnostics.missing_datetime.interval_table.map(
                  (row, index) => (
                    <TableRow
                      key={index}
                      hover
                      sx={{
                        backgroundColor:
                          row.duration_minutes > 120
                            ? "rgba(211, 47, 47, 0.08)"  // red
                            : row.duration_minutes > 30
                            ? "rgba(237, 108, 2, 0.08)"  // orange
                            : "inherit"
                      }}
                    >
                      <TableCell>{row.start}</TableCell>
                      <TableCell>{row.end}</TableCell>
                      <TableCell align="right">
                        {row.duration_minutes}
                      </TableCell>
                      <TableCell>{row.month}</TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>

    {/* =============================== */}
    {/* Missing Value Card */}
    {/* =============================== */}
    <Card>
      <CardContent>
        <Typography variant="subtitle1" fontWeight="bold" color="warning.main">
          Missing Values in Column
        </Typography>

        <Typography variant="body2" sx={{ mt: 1 }}>
          {missingDiagnostics.missing_values.summary_text}
        </Typography>


        <Divider sx={{ my: 2 }} />

        {missingDiagnostics.missing_values.interval_table?.length > 0 && (
          <TableContainer
            component={Paper}
            sx={{ maxHeight: 240, overflowY: "auto", borderRadius: 2 }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Start</TableCell>
                  <TableCell>End</TableCell>
                  <TableCell align="right">Duration (min)</TableCell>
                  <TableCell>Month</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {missingDiagnostics.missing_values.interval_table.map(
                  (row, index) => (
                    <TableRow
                      key={index}
                      hover
                      sx={{
                        backgroundColor:
                          row.duration_minutes > 120
                            ? "rgba(211, 47, 47, 0.08)"
                            : row.duration_minutes > 30
                            ? "rgba(237, 108, 2, 0.08)"
                            : "inherit"
                      }}
                    >
                      <TableCell>{row.start}</TableCell>
                      <TableCell>{row.end}</TableCell>
                      <TableCell align="right">
                        {row.duration_minutes}
                      </TableCell>
                      <TableCell>{row.month}</TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  </>
)}

{variabilitySummary && (
  <Card sx={{ mb: 2 }}>
    <CardContent>

      <Typography variant="subtitle1" fontWeight="bold" color="primary">
        Variability Insights
      </Typography>

      {/* Summary Text */}
      <Typography variant="body2" sx={{ mt: 2 }}>
        {variabilitySummary.summary_text}
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* Key Metrics Grid */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>

        <Typography variant="body2">
          <strong>High Variance Zones:</strong>{" "}
          {variabilitySummary.high_variance_zones}
        </Typography>

      </Box>
    </CardContent>
  </Card>
)}


  </Paper>
    </Grid> 


</Grid>
  );
}