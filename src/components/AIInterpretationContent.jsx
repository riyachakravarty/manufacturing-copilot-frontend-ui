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

<Table size="small" tableLayout="fixed">
    <TableHead>
      <TableRow>
        <TableCell sx={{ width: "22%", fontWeight: "bold" }}>
          Feature
        </TableCell>
        <TableCell sx={{ width: "23%", fontWeight: "bold" }}>
          Optimal Operating Range
        </TableCell>
        <TableCell sx={{ width: "55%", fontWeight: "bold" }}>
          Process Rationale
        </TableCell>
      </TableRow>
    </TableHead>

    <TableBody>
      {rows.map((row, idx) => (
        <TableRow
          key={idx}
          sx={{
            verticalAlign: "top",
            "& td": { paddingY: 1 },
          }}
        >
          <TableCell>{row.feature}</TableCell>

          <TableCell>
            {row.range_min} – {row.range_max} {row.unit}
          </TableCell>

          <TableCell
            sx={{
              whiteSpace: "normal",
              lineHeight: 1.5,
              wordBreak: "break-word",
            }}
          >
            <Typography variant="body2">
              {row.process_rationale || "No explicit process rationale found."}
            </Typography>
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
