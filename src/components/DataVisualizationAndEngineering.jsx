import React, { useState, useContext } from 'react';
import {
  Box,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Collapse,
  Checkbox,
  FormControlLabel,
  Button,
  Typography,
  FormGroup,
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FileContext } from '../context/FileContext';
import axios from 'axios';

const AnalysisCard = ({ title, children, expanded, onClick }) => (
  <Card variant="outlined" sx={{ mb: 2 }}>
    <CardHeader
      title={title}
      onClick={onClick}
      sx={{
        backgroundColor: '#004d66',
        color: 'white',
        cursor: 'pointer',
        '&:hover': { backgroundColor: '#006680' }
      }}
    />
    <Collapse in={expanded}>
      <CardContent>{children}</CardContent>
    </Collapse>
  </Card>
);

const DataVisualizationAndEngineering = () => {
  const { uploadedFile } = useContext(FileContext);
  const [expandedCard, setExpandedCard] = useState(null);
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [selectedOutlierColumn, setSelectedOutlierColumn] = useState('');
  const [outputImage, setOutputImage] = useState(null);

  const handleCardClick = (card) => {
    setExpandedCard((prev) => (prev === card ? null : card));
  };

  const handleColumnChange = (col) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const loadColumns = async () => {
    const formData = new FormData();
    formData.append('file', uploadedFile);
    const res = await axios.post('https://your-backend-url/get_columns', formData);
    setColumns(res.data.columns);
  };

  const runVariabilityAnalysis = async () => {
    const formData = new FormData();
    formData.append('file', uploadedFile);
    formData.append('selected_columns', JSON.stringify(selectedColumns));
    const res = await axios.post('https://your-backend-url/variability_analysis', formData);
    setOutputImage(`data:image/png;base64,${res.data.plot}`);
  };

  const runOutlierAnalysis = async () => {
    const formData = new FormData();
    formData.append('file', uploadedFile);
    formData.append('column', selectedOutlierColumn);
    formData.append('method', 'zscore'); // or 'iqr' if you add a dropdown
    const res = await axios.post('https://your-backend-url/outlier_analysis', formData);
    setOutputImage(`data:image/png;base64,${res.data.plot}`);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Grid container spacing={2}>
        {/* Left panel */}
        <Grid item xs={12} md={4}>
          <AnalysisCard
            title="Variability Analysis"
            expanded={expandedCard === 'variability'}
            onClick={() => {
              handleCardClick('variability');
              loadColumns();
            }}
          >
            <FormGroup>
              {columns.map((col) => (
                <FormControlLabel
                  key={col}
                  control={
                    <Checkbox
                      checked={selectedColumns.includes(col)}
                      onChange={() => handleColumnChange(col)}
                    />
                  }
                  label={col}
                />
              ))}
            </FormGroup>
            <Button variant="contained" onClick={runVariabilityAnalysis} sx={{ mt: 2 }}>
              Run Analysis
            </Button>
          </AnalysisCard>

          <AnalysisCard
            title="Outlier Analysis"
            expanded={expandedCard === 'outlier'}
            onClick={() => {
              handleCardClick('outlier');
              loadColumns();
            }}
          >
            <FormControl fullWidth>
              <InputLabel>Column</InputLabel>
              <Select
                value={selectedOutlierColumn}
                onChange={(e) => setSelectedOutlierColumn(e.target.value)}
              >
                {columns.map((col) => (
                  <MenuItem key={col} value={col}>
                    {col}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button variant="contained" onClick={runOutlierAnalysis} sx={{ mt: 2 }}>
              Run Outlier Analysis
            </Button>
          </AnalysisCard>

          {/* Add similar cards for:
              - Missing Value Analysis
              - Missing Value Treatment
              - Outlier Treatment
              These would follow the same structure:
              loadColumns -> handle selection -> call backend API */}
        </Grid>

        {/* Right panel */}
        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardHeader
              title="Analysis Output"
              sx={{ backgroundColor: '#004d66', color: 'white' }}
            />
            <CardContent>
              {outputImage ? (
                <img src={outputImage} alt="Analysis Result" style={{ width: '100%' }} />
              ) : (
                <Typography variant="body1">
                  Run an analysis from the left panel to see results here.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DataVisualizationAndEngineering;
