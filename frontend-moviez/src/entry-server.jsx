import { StaticRouter } from 'react-router'
import { renderToString } from 'react-dom/server'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'

export function render(url) {
  const context = {}

  const html = renderToString(
    <HelmetProvider>
      <StaticRouter location={url} context={context}>
        <App />
      </StaticRouter>
    </HelmetProvider>
  )

  return { html, context }
}
