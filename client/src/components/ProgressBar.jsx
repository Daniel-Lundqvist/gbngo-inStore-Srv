import styles from './ProgressBar.module.css';

export default function ProgressBar({ progress, label, showPercentage = true }) {
  const percentage = Math.min(100, Math.max(0, progress));

  return (
    <div className={styles.container} role="progressbar" aria-valuenow={percentage} aria-valuemin="0" aria-valuemax="100">
      {label && <div className={styles.label}>{label}</div>}
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <div className={styles.percentage}>{Math.round(percentage)}%</div>
      )}
    </div>
  );
}
