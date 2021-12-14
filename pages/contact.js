import Page from '@components/page'

const Contact = () => {
  return (
    <Page title="Contact" footer={false} description="Get in touch.">
      <article>
        <p>Get in touch.</p>

        <blockquote>
          <a href="mailto:robert@craigie.dev?subject=Hello" className="reset">
            robert@craigie.dev
          </a>
        </blockquote>
      </article>
    </Page>
  )
}

export default Contact
