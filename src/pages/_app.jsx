import { Fragment, useEffect } from "react";
import Head from "next/head";
import Script from "next/script";
import { useRouter } from "next/router";

import "@/styles/scss/main.scss";
import Layout from "@/components/layout";
import * as ga from "../lib/google-analytics";

function App({ Component, pageProps }) {
  const router = useRouter();

  // ✅ Detecta si estamos en páginas de evento (pages/e/[eventKey]...)
  const isEventRoute = router.pathname.startsWith("/e/");

  // C. SETUP OF GA PAGE VIEWS
  useEffect(() => {
    const handleRouteChange = (url) => {
      ga.pageview(url);
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return (
    <Fragment>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-script" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments)}
gtag('js', new Date());
gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');`}
      </Script>

      <Head>
        <meta
          name="google-site-verification"
          content="CrzBLjCsCb_XieIj02F3s_rKQckw1GkCbUP_EsBQfqQ"
        />
        <link rel="icon" type="image/png" href="/Icon.png" />
      </Head>

      {/* ✅ Si es /e/* NO uses el Layout global (para evitar doble navbar) */}
      {isEventRoute ? (
        <Component {...pageProps} />
      ) : (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
    </Fragment>
  );
}

export default App;

