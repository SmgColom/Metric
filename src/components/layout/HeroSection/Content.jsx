import styles from './Content.module.scss';
import { AiFillCheckCircle } from "react-icons/ai";
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';

function Content({

  description,
  feature1,
  feature2,
  feature3,
  feature4,
  feature5,
  finalmessage
}) {
  const router = useRouter();

  return (
    <div>
      {/* Contenido dinámico fuera del banner */}
      <div className={styles.text}>
        {description && <p>{description}</p>}
        <div style ={{marginTop: '2em'}}>
        {feature1 && <p><AiFillCheckCircle /> {feature1}</p>}
        {feature2 && <p><AiFillCheckCircle /> {feature2}</p>}
        {feature3 && <p><AiFillCheckCircle /> {feature3}</p>}
        {feature4 && <p><AiFillCheckCircle /> {feature4}</p>}
        {feature5 && <p><AiFillCheckCircle /> {feature5}</p>}
        </div>
        <div style ={{marginTop: '2em'}}>
        {finalmessage && <p>{finalmessage}</p>}
        </div>
        
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '20px' }}>
          <Button className={styles.button} onClick={() => router.push('/contact')}>
            Contáctame
          </Button>
        </div>
      
    </div>
  );
}

export default Content;