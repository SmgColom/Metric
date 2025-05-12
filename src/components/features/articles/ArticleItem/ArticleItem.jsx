import styles from './ArticleItem.module.scss';
import Image from 'next/image';
import Card from '@/components/common/Card';
import ButtonLink from '@/components/common/ButtonLink';

function ArticleItem(props) {
  return (
    <Card size="grid">
      {/* CARD MAIN */}
      <div className={styles.articleMain}>
        <div className={styles.imageBox}>
          <Image 
            src={props.urlToImage} 
            alt={props.title} 
            width={650}
            height={300}
          /> 
        </div>
        <div className={styles.articleContent}>
          <h2>{props.title}</h2>
          <p>{props.description}</p>
        </div>
      </div>
      {/* CARD FOOTER */}
      <div className={styles.articleFooter}>
        <ButtonLink path={props.url} target="_blank">
          Link al artículo
        </ButtonLink>
      </div>
    </Card>
  );
}

export default ArticleItem;