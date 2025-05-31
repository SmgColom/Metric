// This function will be passed the url user navigates to AND sends to GA
export const pageview = (url) => {
    window.gtag(
      'config',
      process.env.NEXT_PUBLIC_GA_ID,
      { path_url: url }
    )
  }