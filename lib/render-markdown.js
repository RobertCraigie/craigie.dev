import marked from 'marked'
import { renderToStaticMarkup } from 'react-dom/server'
import linkStyles from '../components/link/link.module.css'

let DARK_HIGHLIGHTER = null
let LIGHT_HIGHLIGHTER = null

export const setDark = (highlighter) => (DARK_HIGHLIGHTER = highlighter)
export const setLight = (highlighter) => (LIGHT_HIGHLIGHTER = highlighter)

const renderer = new marked.Renderer()

renderer.heading = (text, level, raw, slugger) => {
  const id = slugger.slug(text)
  const Component = `h${level}`

  return renderToStaticMarkup(
    <Component>
      <a href={`#${id}`} id={id} className="header-link">
        {text}
      </a>
    </Component>
  )
}

renderer.link = (href, _, text) =>
  `<a href=${href} target="_blank" rel="noopener noreferrer" class="${linkStyles.underline}">${text}</a>`

renderer.checkbox = () => ''
renderer.listitem = (text, task, checked) => {
  if (task) {
    return `<li class="reset"><span class="check">&#8203;<input type="checkbox" disabled ${
      checked ? 'checked' : ''
    } /></span><span>${text}</span></li>`
  }

  return `<li>${text}</li>`
}
renderer.code = (code, options) => {
  const opts = options.split(' ').map((o) => o.trim())
  const language = opts[0]

  const theme = LIGHT_HIGHLIGHTER.getTheme()
  theme.bg = '#f5f5f5'
  const renderedLight = LIGHT_HIGHLIGHTER.codeToHtml(code, language, theme)
  const renderedDark = DARK_HIGHLIGHTER.codeToHtml(code, language)

  return `
  <div style="display: var(--shiki-highlight-dark)">
    ${renderedDark}
  </div>
  <div style="display: var(--shiki-highlight-light)">
    ${renderedLight}
  </div>
  `
}

marked.setOptions({
  gfm: true,
  breaks: true,
  headerIds: true,
  renderer,
})

export const renderMarkdown = (markdown) => marked(markdown)
export default renderMarkdown
