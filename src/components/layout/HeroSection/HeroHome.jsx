import styles from './HeroHome.module.scss';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Button from '@/components/common/Button';

function HeroSplitSection({ title, description, images = [], children }) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images]);

  return (
    <>
      <section className={styles.heroSplit}>
        <div className={styles.textContent}>
          <h1><span>{title}</span></h1>
          <p>{description}</p>
          {children}
        </div>

        <div className={styles.imageWrapper}>
          {images.length > 0 && (
            <Image
              src={images[current].src}
              alt={images[current].alt || title}
              fill
              priority
              className={styles.image}
            />
          )}
        </div>
      </section>

      <div className={styles.button}>
        <Button onClick={() => router.push('/contact')}>
          Conversemos
        </Button>
      </div>
    </>
  );
}

export default HeroSplitSection;



