import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom";

const rootElement = document.getElementById('root')

const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)

if (rootElement && rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app)
} else if (rootElement) {
  createRoot(rootElement).render(app)
}
