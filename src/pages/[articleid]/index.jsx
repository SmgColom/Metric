import { Fragment } from 'react';
import Head from 'next/head';

import ArticleDetail from '@/components/features/articles/ArticleDetail';

function ArticleDetailPage(props) {
  const { article } = props;  

  return (
    <Fragment>
      <Head>
        <title>{`CodeFeed | ${article.category}`}</title>
        <meta 
          name='description'
          description={article.title + ': ' + article.description}
        />
      </Head>
      <ArticleDetail 
        image={article.image}
        title={article.title}
        description={article.description}
        category={article.category}
      />
    </Fragment>
  );
}

// STATIC SITE DYNAMIC PATHS (snippet: "ngspa")
export const getStaticPaths = async () => {
  const response = await fetch(`https://newsapi.org/v2/everything?q=running&language=es&pageSize=6&apiKey=${process.env.WELLNESS_API_KEY}`);
  const data = await response.json();
  const articles = data.articles;

  const paths = articles.map((_, index) => ({
    params: { articleid: index.toString() },
  }));

  return {
    paths,
    fallback: false
  };
}

export const getStaticProps = async (context) => {
  const response = await fetch(`https://newsapi.org/v2/everything?q=running&language=es&pageSize=6&apiKey=${process.env.WELLNESS_API_KEY}`);
  const data = await response.json();
  const articles = data.articles;

  const articleIndex = parseInt(context.params.articleid);
  const article = articles[articleIndex];

  if (!article) {
    return { notFound: true };
  }

  return {
    props: { article },
  };
};

export default ArticleDetailPage;
