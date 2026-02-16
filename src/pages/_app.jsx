// src/pages/_app.jsx
import { Fragment } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

import "@/styles/scss/main.scss";
import Layout from "@/components/layout";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  // Detecta si estamos en páginas de evento (pages/e/[eventKey]...)
  const isEventRoute = router.pathname.startsWith("/e/");

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


