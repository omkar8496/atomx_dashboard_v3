import styles from "./QuickActionCard.module.css";

export function QuickActionCard({ title, description, iconColor, onClick }) {
  return (
    <button type="button" className={styles.card} onClick={onClick}>
      <div className={styles.icon} style={{ backgroundColor: iconColor }}>
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
          <path
            d="M12 12.75c1.795 0 3.25-1.455 3.25-3.25S13.795 6.25 12 6.25 8.75 7.705 8.75 9.5s1.455 3.25 3.25 3.25Zm0 0c-3.175 0-5.75 2.575-5.75 5.75h11.5c0-3.175-2.575-5.75-5.75-5.75Z"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
      <div>
        <p className={styles.title}>{title}</p>
        <p className={styles.description}>{description}</p>
      </div>
    </button>
  );
}
