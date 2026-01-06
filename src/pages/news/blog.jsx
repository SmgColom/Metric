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
    content="Artículos de salud, cuidado personal y bienestar familiar. Aprende cómo proteger tu bienestar físico y mental con nuestros consejos de expertos."
  />
  <meta name="keywords" content="bienestar, salud, seguros, salud familiar, cuidado personal, artículos de salud" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://miletoroseguros.vercel.app/" />
  <meta property="og:title" content="Salud y Bienestar | Seguros Mile Toro" />
  <meta property="og:description" content="Explora consejos de salud, bienestar y protección para ti y tu familia." />
  <meta property="og:image" content="https://miletoroseguros.vercel.app/public/backgrounds/Bienestar.jpg" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://miletoroseguros.vercel.app/news/blog" />
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