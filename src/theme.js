// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#003366', // dark blue
    },
    secondary: {
      main: '#4CAF50', // green
    },
    background: {
      default: '#f4f6f8',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: ['"Roboto"', 'sans-serif'].join(','),
    h5: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
    },
  },
});

export default theme;
