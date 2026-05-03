import type { User } from 'firebase/auth';
import type { MainTab } from '../../types';
import styles from './Nav.module.css';

interface Props {
  tab: MainTab;
  streak: number;
  user: User | null;
  onSwitch: (tab: MainTab) => void;
  onLogout: () => void;
}

export default function Nav({ tab, streak, user, onSwitch, onLogout }: Props) {
  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <div className={styles.logoMark}>
          <svg viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.4" />
            <path d="M8 5v3l2 2" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </div>
        <span className={styles.brand}>Inner<span>ise</span></span>
      </div>

      <div className={styles.right}>
        <div className={styles.streak}>
          <div className={styles.fire} />
          <span>{streak}</span>
          <span className={styles.streakUnit}>j</span>
        </div>
        <button
          className={`${styles.tab} ${tab === 'f1' ? styles.active : ''}`}
          onClick={() => onSwitch('f1')}
        >
          Check-in
        </button>
        <button
          className={`${styles.tab} ${tab === 'f2' ? styles.active : ''}`}
          onClick={() => onSwitch('f2')}
        >
          Diagnostic
        </button>
        {user && (
          <button className={styles.logoutBtn} onClick={onLogout} title="Se déconnecter">
            <img src={user.photoURL ?? ''} alt={user.displayName ?? ''} className={styles.avatar} />
          </button>
        )}
      </div>
    </nav>
  );
}
