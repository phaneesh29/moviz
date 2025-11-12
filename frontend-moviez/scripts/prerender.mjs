import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const distDir = path.resolve(projectRoot, 'dist')
const ssrDir = path.resolve(projectRoot, 'dist-ssr')

const templatePath = path.join(distDir, 'index.html')
const ssrFiles = await readdir(ssrDir)
const entryFile = ssrFiles.find(file => /^entry-server\.(mjs|js|cjs)$/.test(file))

if (!entryFile) {
  throw new Error('Unable to locate SSR entry bundle in dist-ssr.')
}

const ssrEntryPath = path.join(ssrDir, entryFile)

const template = await readFile(templatePath, 'utf8')
const ssrModule = await import(pathToFileURL(ssrEntryPath))
const render = ssrModule.render || ssrModule.default?.render

if (typeof render !== 'function') {
  throw new Error('SSR bundle does not export a render() function.')
}

const routesToPrerender = [
  { path: '/', output: 'index.html' },
  { path: '/about' },
  { path: '/search' },
  { path: '/watch-later' },
  { path: '/404', output: '404.html' }
]

for (const route of routesToPrerender) {
  const { path: url, output } = route
  const { html, context } = await render(url)

  const redirectTarget = context?.url

  let renderedHtml
  if (redirectTarget) {
    const redirectBlock = [
      `<meta http-equiv="refresh" content="0; url=${redirectTarget}">`,
      `<script>window.location.href='${redirectTarget}'</script>`,
      '<p>Redirecting...</p>'
    ].join('')
    renderedHtml = template.replace('<!--app-html-->', redirectBlock)
  } else {
    renderedHtml = template.replace('<!--app-html-->', html)
  }

  let outputPath
  if (output) {
    outputPath = path.join(distDir, output)
  } else {
    const normalized = url.replace(/^\//, '')
    outputPath = path.join(distDir, normalized, 'index.html')
  }

  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, renderedHtml, 'utf8')
}

console.log(`Pre-rendered routes: ${routesToPrerender.map(({ path }) => path).join(', ')}`)
