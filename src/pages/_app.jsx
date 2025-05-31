import { Fragment, useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import { useRouter } from 'next/router';

import '@/styles/scss/main.scss'
import Layout from '@/components/layout';
import * as ga from '../lib/google-analytics';

function App({ Component, pageProps }) {
  // C. SETUP OF GA PAGE VIEWS
  const router = useRouter();
  useEffect(() => {
    // C1: Declare function which passes clicked page url to GA4 "event" config function
    const handleRouteChange = (url) => {
      ga.pageview(url)
    }
    // C2: Subscribe to the change event when component mounts
    router.events.on('routeChangeComplete', handleRouteChange)
    // C3: Unsubscribe from change event on unmount
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  return (
    <Fragment>
      <Script 
      src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
      strategy="afterInteractive"
      />
      <Script
      id="google-analytics-script"
      strategy="afterInteractive"
      >
        {`window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments)}
  gtag('js', new Date());

  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');`}
      </Script>

      <Head>
        <link rel="shortcut icon" href="/images/favicon.ico" />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Fragment>
  )
}

export default App;
