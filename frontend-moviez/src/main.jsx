import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom";

const rootElement = document.getElementById('root')

const app = (
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
)

if (rootElement && rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app)
} else if (rootElement) {
  createRoot(rootElement).render(app)
}
