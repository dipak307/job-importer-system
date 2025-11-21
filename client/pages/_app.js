import '../styles/globals.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ToastProvider from "../components/ToastProvider";

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    background: { default: '#f7f8fb' }
  },
  typography: { fontFamily: 'Inter, Arial, sans-serif' }
});

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastProvider>
      <Component {...pageProps} />
      </ToastProvider>
    </ThemeProvider>
  );
}
