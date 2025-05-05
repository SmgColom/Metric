// import "@/styles/globals.css";
import "@/styles/scss/main.scss";

import Header from '@/components/layout/Header'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Header />
      <Component {...pageProps} />
    </>
  )
}
