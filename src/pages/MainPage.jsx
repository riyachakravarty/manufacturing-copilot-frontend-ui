// src/pages/MainPage.jsx

import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Box, Typography, Tabs, Tab, Card, CardContent, Chip } from '@mui/material';
import { DataObject, Insights, Build, PrecisionManufacturing } from '@mui/icons-material';
import DataVisualizationAndEngineering from '../components/DataVisualizationAndEngineering';
import ExploratoryDataAnalysis from "../components/ExploratoryDataAnalysis";
import FeatureEngineering from "../components/FeatureEngineering";
import MLModelDevelopment from "../components/MLModelDevelopment";


const tabLabels = [
  { label: "Data Visualization & Engineering", icon: <DataObject /> },
  { label: "Exploratory Data Analysis", icon: <Insights /> },
  { label: "Feature Engineering", icon: <Build /> },
  { label: "ML Model Development", icon: <PrecisionManufacturing /> },
];

const MainPage = () => {
  const { selectedFile, selectedMode } = useContext(AppContext);
  const [currentTab, setCurrentTab] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 0:
        return <DataVisualizationAndEngineering />;
      case 1:
        return <ExploratoryDataAnalysis />;
      case 2:
        return <FeatureEngineering />;
      case 3:
        return <MLModelDevelopment/>;
      default:
        return (
          <Typography variant="body1">
            This section will contain features for <strong>{tabLabels[currentTab].label}</strong>. You can implement graphs, inputs, model config options, etc., here.
          </Typography>
        );
    }
  };

  return (
    <Box sx={{ padding: 4,height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Typography variant="h4" sx={{ mb: 2, color: 'primary.main' }}>
        Welcome to Nexus AI
      </Typography>

      {/* File + Mode */}
      <Box sx={{ mb: 3 }}>
        {selectedFile && (
          <Chip
            label={`📄 File: ${selectedFile.name}`}
            color="success"
            variant="outlined"
            sx={{ mr: 2 }}
          />
        )}
        {selectedMode && (
          <Chip
            label={`🧭 Mode: ${selectedMode}`}
            color="info"
            variant="outlined"
          />
        )}
      </Box>

      {/* Tab Navigation */}
      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        indicatorColor="secondary"
        textColor="inherit"
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2, flexShrink: 0 }}
      >
        {tabLabels.map((tab, index) => (
          <Tab
            key={index}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {tab.icon}
                <span>{tab.label}</span>
              </Box>
            }
          />
        ))}
      </Tabs>

      {/* Tab Content Area */}
      <Card
    sx={{
      borderRadius: 4,
      boxShadow: 3,
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
      minHeight: 0,
    }}
  >
        <CardContent sx={{ flexGrow: 1, minHeight: 0, p: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
     
        {renderTabContent()}
     
    </CardContent>
      </Card>
    </Box>
  );
};

export default MainPage;
