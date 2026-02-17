import React from "react";
import { Box, Typography, Divider } from "@mui/material";

const AIInterpretationContentModel = ({ data }) => {
  // Safety guard
  if (!data || !data.model_assessment || !data.risk_assessment) {
    return null;
  }

  const { model_assessment, risk_assessment } = data;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      {/* --- Model Assessment Section --- */}
      <Typography variant="subtitle2" color="text.secondary">
        Fit Quality
      </Typography>
      <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
        {model_assessment.fit_quality}
      </Typography>

      <Typography variant="subtitle2" color="text.secondary">
        Generalization
      </Typography>
      <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
        {model_assessment.generalization}
      </Typography>

      <Typography variant="subtitle2" color="text.secondary">
        Bias
      </Typography>
      <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
        {model_assessment.bias_explanation}
      </Typography>

      <Typography variant="subtitle2" color="text.secondary">
        Temporal Behavior
      </Typography>
      <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
        {model_assessment.temporal_behavior}
      </Typography>

      <Typography variant="subtitle2" color="text.secondary">
        Operational Readiness
      </Typography>
      <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
        {model_assessment.operational_readiness}
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* --- Risk Assessment Section --- */}
      <Typography variant="subtitle2" color="text.secondary">
        Deployment Recommendation
      </Typography>
      <Typography variant="body2">
        {risk_assessment.deployment_recommendation}
      </Typography>

      <Typography variant="subtitle2" color="text.secondary">
        Confidence Score
      </Typography>
      <Typography variant="body2">
        {risk_assessment.confidence_score}
      </Typography>

      <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
        {risk_assessment.justification}
      </Typography>
    </Box>
  );
};

export default AIInterpretationContentModel;
