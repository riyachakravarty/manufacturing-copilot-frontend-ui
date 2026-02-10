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
    <Box
    sx={{
      mt: 2,
      overflowX: "auto",
      width: "100%",
    }}
  >
    <Table
      size="small"
      stickyHeader
      sx={{
        minWidth: 900,       // forces horizontal scroll
        tableLayout: "fixed",
      }}
    >
      <TableHead>
        <TableRow>
          <TableCell sx={{ width: 220, fontWeight: "bold" }}>
            Feature
          </TableCell>
          <TableCell sx={{ width: 260, fontWeight: "bold" }}>
            Optimal Operating Range
          </TableCell>
          <TableCell sx={{ width: 420, fontWeight: "bold" }}>
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
              "& td": {
                paddingY: 0.75,
                paddingX: 1,
              },
            }}
          >
            <TableCell>{row.feature}</TableCell>
  
            <TableCell>
              {Number(row.range_min).toFixed(2)} – {Number(row.range_max).toFixed(2)}
            </TableCell>
  
            <TableCell>
              <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
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
