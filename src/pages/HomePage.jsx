import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Divider,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const Home = ({ onFileUpload, onModeSelect }) => {
  const [selectedMode, setSelectedMode] = React.useState('');
  const fileInputRef = React.useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) onFileUpload(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleModeChange = (event) => {
    setSelectedMode(event.target.value);
    onModeSelect(event.target.value);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Welcome to Manufacturing Co-Pilot
      </Typography>
      <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 4 }}>
        Start by uploading your data and selecting how you'd like to proceed.
      </Typography>

      {/* File Upload Section */}
      <Card sx={{ mb: 4, p: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Step 1: Upload CSV File
          </Typography>
          <Button
            variant="contained"
            startIcon={<UploadFileIcon />}
            onClick={handleUploadClick}
            sx={{ mt: 2 }}
          >
            Choose File
          </Button>
          <input
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </CardContent>
      </Card>

      {/* Mode Selection Section */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Step 2: Select Interaction Mode
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Mode</InputLabel>
            <Select value={selectedMode} label="Select Mode" onChange={handleModeChange}>
              <MenuItem value="click">Click of a Button</MenuItem>
              <MenuItem value="genai">Gen-AI Led Prompt</MenuItem>
            </Select>
          </FormControl>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Home;
