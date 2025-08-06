// src/components/Tabs.jsx

import React from "react";
import { Tabs, Tab } from "@mui/material";

const TabbedInterface = ({ value, handleChange }) => {
  return (
    <Tabs
      value={value}
      onChange={handleChange}
      indicatorColor="primary"
      textColor="primary"
      centered
      sx={{ marginBottom: 3 }}
    >
      <Tab label="Data Visualization & Engineering" />
      <Tab label="Exploratory Data Analysis" />
      <Tab label="Feature Engineering" />
      <Tab label="ML Model Development" />
    </Tabs>
  );
};

export default TabbedInterface;
