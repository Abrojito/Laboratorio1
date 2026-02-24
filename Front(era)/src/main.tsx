import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import { FloatingMenuProvider } from './context/FloatingMenuContext'; // asegurate que la ruta esté bien
import { ModalProvider } from './context/ModalContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
    zIndex: {
        mobileStepper: 1000,
        fab: 1050,
        speedDial: 1050,
        appBar: 1100,
        drawer: 1200,
        modal: 2000,
        snackbar: 2100,
        tooltip: 2200,
    },
});

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            <BrowserRouter>
                <FloatingMenuProvider>
                    <ModalProvider>
                        <App />
                    </ModalProvider>
                </FloatingMenuProvider>
            </BrowserRouter>
        </ThemeProvider>
    </StrictMode>,
);
