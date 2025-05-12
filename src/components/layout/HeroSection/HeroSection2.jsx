import styles from './HeroSection2.module.scss';


function HeroSection2({ title, description}) {
  // SEE on STATIC ASSETS: https://nextjs.org/docs/pages/building-your-application/optimizing/static-assets

  return (
    <div 
      className={styles.showcase}
    >
      <div className={styles.overlay}>
        <h1><span>{title}</span></h1>
        <p>{description}</p>
      </div>
      
    </div>
  );
}

export default HeroSection2;