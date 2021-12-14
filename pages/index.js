import Page from '@components/page'
import Link from '@components/link'

// TODO: write more
// TODO: add social links
// TODO: link directly to Prisma Client Python repo?

const About = () => {
  return (
    <Page description="Hi, I'm Robert. Python developer and the creator of Prisma Client Python. The first fully statically typed ORM for Python.">
      <article>
        <h1>Robert Craigie</h1>

        <p>
          Python developer and the creator of{' '}
          <Link
            underline
            href="https://github.com/RobertCraigie/prisma-client-py"
          >
            Prisma Client Python
          </Link>
          . The first fully statically typed ORM for Python.{' '}
        </p>

        <p>
          <Link underline href="/blog">
            Writing
          </Link>{' '}
          about databases and code.
        </p>
      </article>
    </Page>
  )
}

export default About
