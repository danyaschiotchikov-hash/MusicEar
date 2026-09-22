import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ActionTrackerProvider } from './context/ActionTrackerContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ActionTrackerProvider>
      <App />
    </ActionTrackerProvider>
  </StrictMode>,
);
