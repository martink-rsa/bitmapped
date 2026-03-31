import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <span className={styles.version}>bitmapped</span>
      <span className={styles.sep}>&middot;</span>
      <a
        href="https://www.npmjs.com/package/bitmapped"
        target="_blank"
        rel="noopener noreferrer"
      >
        npm
      </a>
      <span className={styles.sep}>&middot;</span>
      <a
        href="https://github.com/mrspeaker/bitmapped"
        target="_blank"
        rel="noopener noreferrer"
      >
        github
      </a>
    </footer>
  );
}
