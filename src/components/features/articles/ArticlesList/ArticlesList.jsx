import ArticleItem from '../ArticleItem/ArticleItem'
import Container from '@/components/common/Container/Container';

function ArticlesList(props) {
  const { articles } = props;

  return (
    <Container>
      {/* ADJUST LIST IDs TOO (id -> _id) */}
      {articles.map((article, index) => (
        <ArticleItem
            key={article._id ? article._id : index}
            id={article._id ? article._id : index}
          image={article.image}
          urlToImage={article.urlToImage}
          url={article.url}
          title={article.title}
          description={article.description}
          category={article.category}
        />
      ))}
    </Container>
  );
}

export default ArticlesList;