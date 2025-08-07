import React, { useEffect, useState, useContext } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
  CircularProgress,
  Box,
  Grid,
  Paper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AppContext } from '../context/AppContext';
import axios from 'axios';

const BASE_URL = 'https://your-backend-url.com'; // Replace with your actual backend URL

const DataVisualizationAndEngineering = () => {
  const { uploadedFile } = useContext(AppContext);
  const [expandedPanel, setExpandedPanel] = useState(false);

  // For Variability Analysis
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [loadingColumns, setLoadingColumns] = useState(false);

  const [plotImage, setPlotImage] = useState(null);
  const [loadingPlot, setLoadingPlot] = useState(false);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedPanel(isExpanded ? panel : false);

    if (panel === 'variability' && isExpanded) {
      fetchColumns();
    }
  };

  const fetchColumns = async () => {
    try {
      setLoadingColumns(true);
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const response = await axios.post(`${BASE_URL}/get_columns`, formData);
      setColumns(response.data.columns);
    } catch (error) {
      console.error('Error fetching columns:', error);
    } finally {
      setLoadingColumns(false);
    }
  };

  const handleColumnToggle = (column) => {
    setSelectedColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column]
    );
  };

  const runVariabilityAnalysis = async () => {
    try {
      setLoadingPlot(true);
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('selected_columns', JSON.stringify(selectedColumns));
      formData.append('prompt', `variability analysis where selected variables are ${selectedColumns.join(', ')}`);

      const response = await axios.post(`${BASE_URL}/chat`, formData, {
        responseType: 'arraybuffer',
      });

      const blob = new Blob([response.data], { type: 'image/png' });
      const imageUrl = URL.createObjectURL(blob);
      setPlotImage(imageUrl);
    } catch (error) {
      console.error('Error generating variability plot:', error);
    } finally {
      setLoadingPlot(false);
    }
  };

  return (
    <Box p={2}>
      <Accordion
        expanded={expandedPanel === 'variability'}
        onChange={handleAccordionChange('variability')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Variability Analysis</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {loadingColumns ? (
            <CircularProgress />
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={10}>
                <Paper elevation={2} style={{ maxHeight: 200, overflowY: 'auto', padding: '10px' }}>
                  {columns.map((col) => (
                    <FormControlLabel
                      key={col}
                      control={
                        <Checkbox
                          checked={selectedColumns.includes(col)}
                          onChange={() => handleColumnToggle(col)}
                        />
                      }
                      label={col}
                    />
                  ))}
                </Paper>
              </Grid>
              <Grid item xs={2} container alignItems="center">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={runVariabilityAnalysis}
                  disabled={selectedColumns.length === 0 || loadingPlot}
                >
                  {loadingPlot ? <CircularProgress size={24} /> : 'Run Variability Analysis'}
                </Button>
              </Grid>
            </Grid>
          )}
        </AccordionDetails>
      </Accordion>

      {plotImage && (
        <Box mt={3}>
          <img src={plotImage} alt="Variability Plot" style={{ maxWidth: '100%' }} />
        </Box>
      )}
    </Box>
  );
};

export default DataVisualizationAndEngineering;
