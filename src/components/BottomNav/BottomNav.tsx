import type { MainTab } from '../../types';
import styles from './BottomNav.module.css';

interface Props {
  tab: MainTab;
  onSwitch: (tab: MainTab) => void;
}

export default function BottomNav({ tab, onSwitch }: Props) {
  return (
    <div className={styles.nav}>
      <button
        className={`${styles.item} ${tab === 'f1' ? styles.active : ''}`}
        onClick={() => onSwitch('f1')}
      >
        <svg className={styles.icon} viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.4" />
          <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <span className={styles.label}>Check-in</span>
        <div className={styles.dot} />
      </button>

      <button
        className={`${styles.item} ${tab === 'f2' ? styles.active : ''}`}
        onClick={() => onSwitch('f2')}
      >
        <svg className={styles.icon} viewBox="0 0 20 20" fill="none">
          <rect x="4" y="4" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="1.4" />
          <path d="M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <span className={styles.label}>Diagnostic</span>
        <div className={styles.dot} />
      </button>

      <button
        className={styles.item}
        onClick={() => alert('F3 — Dashboard coach · Disponible bientôt')}
      >
        <svg className={styles.icon} viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.4" />
          <path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <span className={styles.label}>Coach</span>
        <div className={styles.dot} />
      </button>
    </div>
  );
}
