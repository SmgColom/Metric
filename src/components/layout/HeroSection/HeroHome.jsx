import styles from './HeroHome.module.scss';


function HeroSplitSection({ title, description,imageUrl }) {
  return (
    <section className={styles.heroSplit}>
      <div className={styles.textContent}>
        
      <h1><span>{title}</span></h1>
        <p>{description}</p>
      </div>
      <div className={styles.imageSide}>
      <img src={imageUrl} alt={title} />
      </div>
    </section>
  );
}

export default HeroSplitSection;