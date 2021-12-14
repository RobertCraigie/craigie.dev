import Post from '@components/post'
import getPosts from '@lib/get-posts'
import * as renderer from '@lib/render-markdown'
import * as shiki from 'shiki'

const PostPage = (props) => {
  return <Post {...props} />
}

export const getStaticProps = async ({ params: { slug } }) => {
  const posts = getPosts()
  const postIndex = posts.findIndex((p) => p.slug === slug)
  const post = posts[postIndex]
  const { body, ...rest } = post

  // yes this is a horrible way of doing this but it is easy and works
  renderer.setDark(await shiki.getHighlighter({ theme: 'github-dark' }))
  renderer.setLight(await shiki.getHighlighter({ theme: 'github-light' }))

  return {
    props: {
      previous: posts[postIndex + 1] || null,
      next: posts[postIndex - 1] || null,
      ...rest,
      html: renderer.renderMarkdown(body),
    },
  }
}

export const getStaticPaths = () => {
  return {
    paths: getPosts().map((p) => `/blog/${p.slug}`),
    fallback: false,
  }
}

export default PostPage
