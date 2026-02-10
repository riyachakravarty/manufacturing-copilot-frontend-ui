import {
  Box,
  Typography,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";

const AIInterpretationContent = ({ rows, sources }) => {
  if (!rows || rows.length === 0) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography
        variant="subtitle2"
        color="text.secondary"
        sx={{ mb: 1 }}
      >
        Optimal Operating Ranges Interpretation
      </Typography>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Feature</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>
              Optimal Operating Range
            </TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>
              Process Rationale
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row, idx) => (
            <TableRow key={idx}>
              <TableCell>{row.feature}</TableCell>
              <TableCell>
                {row.range_min} – {row.range_max} {row.unit}
              </TableCell>
              <TableCell sx={{ whiteSpace: "pre-line" }}>
                {row.process_rationale}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {sources && sources.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="text.secondary">
            Sources: {sources.join(", ")}
          </Typography>
        </>
      )}
    </Box>
  );
};

export default AIInterpretationContent;
