  import { Fragment } from "react"
  import Head from "next/head"

  import HeroSection from "@/components/layout/HeroSection"
  import ArticlesList from "@/components/features/articles/ArticlesList";

  function Blog(props) {
    const { WellnessArticles } = props;

    return (
      <Fragment>

<Head>
  <title>Infórmate | Metric Solutions</title>
  <meta 
    name="description"
    content="Artículos de las ultimas tendencias del mundo del running en todo el planeta."
  />
  <meta name="keywords" content="running, salud, maraton, carrera, correr, artículos de running" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://metric-omega.vercel.app/" />
  <meta property="og:title" content="Metric Solutions | Tendencias running" />
  <meta property="og:description" content="Explora que pasa en el mundo del running a nivel mundial." />
  <meta property="og:image" content="https://metric-omega.vercel.app/public/backgrounds/Running.jpg" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://metric-omega.vercel.app//news/blog" />
</Head>
        <HeroSection 
          title="Tendencias"
          description="Encuentra la mejor información del mundo del Running a nivel internacional"
          bgImage="/backgrounds/Running.jpg"
        />

        {WellnessArticles.length > 0 && <ArticlesList articles={WellnessArticles}/>}
      </Fragment>
    )
  }

  // ngsp
  export const getStaticProps = async () => {
    const response = await fetch(`https://newsapi.org/v2/everything?q=running&language=es&pageSize=6&apiKey=${process.env.WELLNESS_API_KEY}`);
    const data = await response.json();
    const articles = data.articles;
    //console.log(articles);

    // Error handling
    if(!response.ok){
      throw new Error(`Failed to fetch posts - Error ${response.status}: ${data.message}`)
    }

    return {
      props: {
        WellnessArticles: articles
      },
      revalidate: 60  // ISR
    };
  };

  export default Blog