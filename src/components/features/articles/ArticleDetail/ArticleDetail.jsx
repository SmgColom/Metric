import styles from './ArticleDetail.module.scss';
import Image from 'next/image'
import Card from '@/components/common/Card';
import ButtonLink from '@/components/common/ButtonLink';

function ArticleDetail(props) {
  return (
    <Card size="single">
      {/* CARD MAIN */}
      <div className={styles.articleMain}>
        <div className={styles.imageBox}>
          <Image 
            className={styles.nextImage}
            src={props.image} 
            alt={props.title}
            fill={true}
            sizes="100vw"
            priority={true}
          />
        </div>
        <div className={styles.articleContent}>
          <h2>{props.title}</h2>
          <p>{props.description}</p>
        </div>
      </div>
      {/* CARD FOOTER */}
      <div className={styles.articleFooter}>
        <ButtonLink path="/">Volver</ButtonLink>
      </div>
    </Card>
  );
}

export default ArticleDetail;