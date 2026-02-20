// Split3Layout.jsx
import React from "react";
import { Box } from "@mui/material";

export default function Split3Layout({ left, middle, right }) {
  return (
    <Box
      sx={{
        height: "100%",                           // gets constrained by parent (MainPage)
        display: "grid",
        gridTemplateColumns: "minmax(260px, 28%) 1fr minmax(300px, 30%)",
        gridTemplateRows: "1fr",
        gap: 2,
        minHeight: 0,                              // CRITICAL for flex clipping
        overflow: "hidden",                        // ensure columns handle overflow
      }}
    >
      <Box
        sx={{
          overflowY: "auto",
          height: "100%",
          minHeight: 0,
          boxSizing: "border-box",
          px: 1,
        }}
      >
        {left}
      </Box>

      <Box
        sx={{
          overflowY: "auto",
          height: "100%",
          minHeight: 0,
          boxSizing: "border-box",
          px: 1,
        }}
      >
        {middle}
      </Box>

      <Box
        sx={{
          overflowY: "auto",
          height: "100%",
          minHeight: 0,
          boxSizing: "border-box",
          px: 2,
        }}
      >
        {right}
      </Box>
    </Box>
  );
}
