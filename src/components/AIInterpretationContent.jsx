// src/components/AIInterpretationContent.jsx
import { Box, Typography, Divider } from "@mui/material";

const AIInterpretationContent = ({ observations, explanation, sources }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      
      <Typography variant="subtitle2" color="text.secondary">
        Key Observations
      </Typography>
      <Typography variant="body2">
        {observations}
      </Typography>

      <Divider />

      <Typography variant="subtitle2" color="text.secondary">
        Explanation
      </Typography>
      <Typography
        variant="body2"
        sx={{ whiteSpace: "pre-line", lineHeight: 1.6 }}
      >
        {explanation}
      </Typography>

      {sources && sources.length > 0 && (
        <>
          <Divider />
          <Typography variant="caption" color="text.secondary">
            Sources: {sources.join(", ")}
          </Typography>
        </>
      )}
    </Box>
  );
};

export default AIInterpretationContent;
