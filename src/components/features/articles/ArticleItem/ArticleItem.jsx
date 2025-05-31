import Image from 'next/image';
import { useRouter } from 'next/router';

import styles from './ArticleItem.module.scss';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import ButtonLink from '@/components/common/ButtonLink';

function ArticleItem(props) {
  // Programmatic Navigation
  const router = useRouter();
  function handleNavigate() {
    router.push('/' + props.id);
  }

  return (
    <Card size="grid">
      {/* CARD MAIN */}
      <div className={styles.articleMain}>
        <div className={styles.imageBox}>
          { props.image ? 
            <Image 
              className={styles.nextImage}
              src={props.image} 
              alt={props.title} 
              fill={true}
              sizes="(max-width: 768px) 100vw, 50vw"
            /> : 
            <Image 
              className={styles.nextImage}
              src={props.urlToImage} 
              alt={props.title} 
              fill={true}
              sizes="(max-width: 768px) 100vw, 50vw"
            /> 
          }
        </div>
        <div className={styles.articleContent}>
          <h2>{props.title}</h2>
          <p>{props.description}</p>
        </div>
      </div>
      {/* CARD FOOTER */}
      <div className={styles.articleFooter}>
        { props.image ? 
          <Button onClick={handleNavigate}>
            Mostrar detalles
          </Button>
        : 
          <ButtonLink path={props.url} target="_blank">
            Link al Artículo
          </ButtonLink>
        }
      </div>
    </Card>
  );
}

export default ArticleItem;