import { readFileSync } from 'fs'
import marked from 'marked'
import parse from 'html-react-parser';
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

  const highlight = opts
    .filter(o => o.startsWith('highlight='))
    .pop()
    ?.replace('highlight=', '')
    .trim()
    .split(',')
    .flatMap((item) => {
      if (item.includes('-')) {
        // Expand ranges like 3-5 into [3,4,5]
        const [start, end] = item.split('-').map(Number)
        return Array(end - start + 1)
          .fill()
          .map((_, i) => i + start)
      }

      return [Number(item)]
    })

  const theme = LIGHT_HIGHLIGHTER.getTheme()
  theme.bg = '#f5f5f5'
  const renderedLight = LIGHT_HIGHLIGHTER.codeToHtml(code, language, theme)
  const renderedDark = DARK_HIGHLIGHTER.codeToHtml(code, language)

  return renderToStaticMarkup(
    <>
      <Code theme='dark' highlight={highlight} rendered={renderedDark} />
      <Code theme='light' highlight={highlight} rendered={renderedLight} />
    </>
  )
}

const excludeChildren = (props) => {
  return {
    ...props,
    children: undefined,
  }
}

const Code = ({ theme, highlight, rendered }) => {
  const code = parse(rendered)

  if (typeof highlight === 'undefined') {
    return <CodeTheme theme={theme}>{code}</CodeTheme>
  }

  let lineno = 0;
  return (
    <CodeTheme theme={theme}>
      <pre {...code.props}>
        <code {...excludeChildren(code.props.children.props)}>
          {code.props.children.props.children.map((element, i) => {
            if (element?.type === 'span' && element.props?.className === 'line') {
              lineno += 1
              if (highlight.includes(lineno)) {
                return (
                  <span {...element.props} className='line hl-line'>
                    {element.props.children}
                  </span>
                )
              }
            }

            return element;
          })}
        </code>
      </pre>
    </CodeTheme>
  )
}

const CodeTheme = ({theme, children}) => {
  return(
    <div style={{display: `var(--shiki-highlight-${theme})`}}>
      {children}
    </div>
  )
}

const toRangeArray = (a) => {
  return a.flatMap((item) => {
    if (item.includes('-')) {
      // Expand ranges like 3-5 into [2,3,4]
      const [start, end] = item.split('-').map(Number)
      return Array(end - start + 1)
        .fill()
        .map((_, i) => i + start - 1)
    }

    return [Number(item) - 1]
  }).sort((a, b) => a - b)
}

marked.setOptions({
  gfm: true,
  breaks: true,
  headerIds: true,
  renderer,
})

export const renderMarkdown = (markdown) => {
  return marked(
      markdown.replaceAll(/{!\s*(.+?)\s*!((\slines\s?)=([0-9 -]+))?\}/ig, (_, filename, __, ___, lines) => {
        const content = readFileSync(filename, 'utf8')
        if (typeof lines === 'undefined') {
          return content;
        }

        const ranges = toRangeArray(lines.split(' '))
        return content
          .split('\n').flatMap((line, i) => {
            if (ranges.includes(i)) {
              return [line]
            }

            return []
          })
          .join('\n')
      }
    )
  )
}
export default renderMarkdown
