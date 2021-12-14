import Page from '@components/page'
import Entry from '@components/entry'

// TODO: proper images
// TODO: resize prisma

const Projects = () => {
  return (
    <Page title="Projects" description="Collection of past and present work.">
      <article>
        <Entry
          title="Prisma Client Python"
          description="Fully type-safe ORM"
          image="https://raw.githubusercontent.com/prisma/presskit/main/Logos/Logo%20White.png"
          href="https://github.com/RobertCraigie/prisma-client-py"
        />

        <Entry
          title="Pyright for Python"
          description="Python wrapper for the Pyright CLI"
          image="https://raw.githubusercontent.com/microsoft/pyright/main/docs/img/PyrightLarge.png"
          href="https://github.com/RobertCraigie/pyright-python"
          position="top"
        />

        <Entry
          title="Pytest Pyright"
          description="A pytest plugin for type checking code"
          image="https://i.gyazo.com/38646a0dfdbfb3ea2719fd703a02ea86.png"
          href="https://github.com/RobertCraigie/pytest-pyright"
          position="top"
        />
      </article>
    </Page>
  )
}

export default Projects
