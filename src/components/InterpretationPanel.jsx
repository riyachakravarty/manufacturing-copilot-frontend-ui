import { Box, Typography, Chip, Divider } from "@mui/material";

const InterpretationPanel = ({ observations, explanation, sources }) => {
  if (!observations && !explanation) return null;

  return (
    <Box
      sx={{
        mt: 3,
        p: 2,
        borderRadius: 2,
        backgroundColor: "#0f1c2e",
        border: "1px solid #1e3a5f",
        maxWidth: "100%",
        wordBreak: "break-word",
        lineHeight: 1.6,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Model Interpretation
      </Typography>

      <Typography variant="subtitle2" color="text.secondary">
        Observations (statistical, no process assumptions)
      </Typography>

      <Typography variant="body2" sx={{ whiteSpace: "pre-line", mt: 1 }}>
        {observations}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" color="text.secondary">
        Process-grounded explanation
      </Typography>

      <Typography variant="body2" sx={{ whiteSpace: "pre-line", mt: 1 }}>
        {explanation}
      </Typography>

      {sources?.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="text.secondary">
            Context sources
          </Typography>
          <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
            {sources.map((src) => (
              <Chip key={src} label={src} size="small" />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

export default InterpretationPanel;
