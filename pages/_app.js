import '../styles/globals.css'
import { useState, useEffect } from 'react'
import Head from 'next/head'

function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <>
      <Head>
        <title>Universal Test Automation Framework</title>
        <meta name="description" content="Web-based interface for automated testing" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp 