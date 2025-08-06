import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MainAppPage from "./pages/MainAppPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/app" element={<MainAppPage />} />
        {/* add more routes later if needed */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
