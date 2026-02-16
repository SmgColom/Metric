import { Fragment, useEffect } from "react";
import Head from "next/head";
import Script from "next/script";
import { useRouter } from "next/router";

import "@/styles/scss/main.scss";
import Layout from "@/components/layout";


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
      <Head>
        <meta
          name="google-site-verification"
          content="CrzBLjCsCb_XieIj02F3s_rKQckw1GkCbUP_EsBQfqQ"
        />
        <link rel="icon" type="image/png" href="/Icon.png" />
      </Head>

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

