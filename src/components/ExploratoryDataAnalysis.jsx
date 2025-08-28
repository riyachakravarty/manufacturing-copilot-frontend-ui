import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Divider,
  Card,
  CardContent,
  IconButton,
  Collapse,
  Button,
  FormControlLabel,
  RadioGroup,
  Radio,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Plot from "react-plotly.js";

const ExploratoryDataAnalysis = ({ BACKEND_URL }) => {
  const [expandedCard, setExpandedCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plotData, setPlotData] = useState(null);

  // Columns & Target
  const [columns, setColumns] = useState([]);
  const [targetColumn, setTargetColumn] = useState("");

  // Q-cut controls
  const [selectedColumn, setSelectedColumn] = useState("");
  const [qCut, setQCut] = useState(4);

  // Fetch columns on tab load
  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/get_columns`);
        const data = await res.json();
        setColumns(data.columns || []);
        if (data.columns?.length > 0) {
          setTargetColumn(data.columns[0]); // default
        }
      } catch (err) {
        console.error("Error loading columns:", err);
      }
    };
    fetchColumns();
  }, [BACKEND_URL]);

  const handleExpand = (card) => {
    setExpandedCard(expandedCard === card ? null : card);
  };

  const runAnalysis = async (endpoint, payload = {}) => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${BACKEND_URL}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Failed to fetch: ${endpoint}`);
      const data = await res.json();
      setPlotData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 2, height: "100%" }}>
      {/* Left Panel */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        
        {/* Target / Objective Selector */}
        <Card>
          <CardContent>
            <Typography variant="subtitle2" fontWeight="bold">
              Target / Objective
            </Typography>
            <Select
              fullWidth
              size="small"
              value={targetColumn}
              onChange={(e) => setTargetColumn(e.target.value)}
              sx={{ mt: 1 }}
            >
              {columns.map((col) => (
                <MenuItem key={col} value={col}>
                  {col}
                </MenuItem>
              ))}
            </Select>
          </CardContent>
        </Card>

        {/* Q-Cut Box Plots */}
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="subtitle1" fontWeight="bold">
                Specialized Q-cut Box Plots
              </Typography>
              <IconButton size="small" onClick={() => handleExpand("qcut")}>
                <ExpandMoreIcon />
              </IconButton>
            </Box>
            <Collapse in={expandedCard === "qcut"}>
              <Typography variant="caption">Select Column</Typography>
              <RadioGroup
                value={selectedColumn}
                onChange={(e) => setSelectedColumn(e.target.value)}
              >
                {columns.map((col) => (
                  <FormControlLabel
                    key={col}
                    value={col}
                    control={<Radio size="small" />}
                    label={col}
                  />
                ))}
              </RadioGroup>

              <TextField
                label="Number of Quantiles"
                type="number"
                size="small"
                fullWidth
                value={qCut}
                onChange={(e) => setQCut(Number(e.target.value))}
                sx={{ mt: 1 }}
              />

              <Button
                variant="contained"
                size="small"
                sx={{ mt: 1 }}
                onClick={() =>
                  runAnalysis("eda_qcut_boxplot", {
                    column: selectedColumn,
                    q: qCut,
                    target: targetColumn,
                  })
                }
              >
                Generate Analysis
              </Button>
            </Collapse>
          </CardContent>
        </Card>

        {/* Other 3 cards will follow here... */}
      </Box>

      {/* Right Panel */}
      <Box sx={{ flex: 2, p: 2, border: "1px solid #ccc", borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom color="primary">
          EDA Output
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}
        {plotData && (
          <Plot
            data={plotData.data}
            layout={plotData.layout}
            style={{ width: "100%", height: "100%", minHeight: 400 }}
            useResizeHandler
          />
        )}
      </Box>
    </Box>
  );
};

export default ExploratoryDataAnalysis;
