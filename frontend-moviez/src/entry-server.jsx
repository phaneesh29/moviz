import { StaticRouter } from 'react-router'
import { renderToString } from 'react-dom/server'
import App from './App.jsx'

export function render(url) {
  const context = {}

  const html = renderToString(
    <StaticRouter location={url} context={context}>
      <App />
    </StaticRouter>
  )

  return { html, context }
}
