import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import { FloatingMenuProvider } from './context/FloatingMenuContext'; // asegurate que la ruta esté bien

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <FloatingMenuProvider>
                <App />
            </FloatingMenuProvider>
        </BrowserRouter>
    </StrictMode>,
);
