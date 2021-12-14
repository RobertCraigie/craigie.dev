const fs = require('fs')
const RSS = require('rss')
const path = require('path')
const marked = require('marked')
const matter = require('gray-matter')

const posts = fs
  .readdirSync(path.resolve(__dirname, '../posts/'))
  .filter((file) => path.extname(file) === '.md')
  .map((file) => {
    const postContent = fs.readFileSync(`./posts/${file}`, 'utf8')
    const { data, content } = matter(postContent)
    return { ...data, body: content }
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date))

const renderer = new marked.Renderer()

renderer.link = (href, _, text) =>
  `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`

marked.setOptions({
  gfm: true,
  breaks: true,
  headerIds: true,
  renderer,
})

const renderPost = (md) => marked(md)

const main = () => {
  const feed = new RSS({
    title: 'Robert Craigie',
    site_url: 'https://craigie.dev',
    feed_url: 'https://craigie.dev/feed.xml',
    image_url: 'https://craigie.dev/og.png',
    language: 'en',
  })

  posts.forEach((post) => {
    const url = `https://craigie.dev/blog/${post.slug}`

    feed.item({
      title: post.title,
      description: renderPost(post.body),
      date: new Date(post.date),
      author: 'Robert Craigie',
      url,
      guid: url,
    })
  })

  const rss = feed.xml({ indent: true })
  fs.writeFileSync(path.join(__dirname, '../public/feed.xml'), rss)
}

main()
