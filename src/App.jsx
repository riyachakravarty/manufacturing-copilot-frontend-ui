import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import { AppProvider } from "./context/AppContext"; // Global context for file, mode, etc.
import theme from "./theme"; // Custom MUI theme with dark blue and green shades
import { PlotProvider } from "./context/PlotContext";

import HomePage from "./pages/HomePage";
import MainPage from "./pages/MainPage";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProvider>
      <PlotProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/main" element={<MainPage />} />
          </Routes>
        </Router>
        </PlotProvider>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
