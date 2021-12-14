import Head from 'next/head'

import Page from '@components/page'
import styles from './error.module.css'

const Error = ({ status }) => {
  return (
    <Page title={status || 'Error'}>
      <Head>
        <title>404 — Robert Craigie</title>
      </Head>

      {status === 404 ? (
        <>
          <h1>This page cannot be found.</h1>
        </>
      ) : (
        <section className={styles.section}>
          <span>{status || '?'}</span>
          <p>An error occurred.</p>
        </section>
      )}
    </Page>
  )
}

export default Error
