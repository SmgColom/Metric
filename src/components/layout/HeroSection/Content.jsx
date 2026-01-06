import styles from './Content.module.scss';

function Content({ features = [] }) {
  return (
    <div className={styles.content}>
      <div className={styles.featuresGrid}>
        {features.map((feature, index) => (
          <div key={index} className={styles.card}>
            <div className={styles.icon}>{feature.icon}</div>
            <p>{feature.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Content;

