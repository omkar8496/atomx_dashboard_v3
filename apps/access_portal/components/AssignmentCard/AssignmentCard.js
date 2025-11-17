import styles from "./AssignmentCard.module.css";

export function AssignmentCard({ assignment }) {
  return (
    <section className={styles.card}>
      <div className={styles.banner}>
        <div>
          <p className={styles.bannerLabel}>Current Assignment</p>
          <p className={styles.bannerCopy}>
            Your active event assignment details
          </p>
        </div>
        <span className={styles.badge}>Live</span>
      </div>

      <div className={styles.body}>
        <div className={styles.row}>
          <div>
            <p className={styles.label}>Event</p>
            <p className={styles.value}>{assignment.event}</p>
          </div>
          <div>
            <p className={styles.label}>Email</p>
            <p className={styles.value}>{assignment.email}</p>
          </div>
        </div>

        <div className={styles.section}>
          <p className={styles.label}>Assigned Period</p>
          <div className={styles.period}>
            <CalendarIcon />
            <span>{assignment.period}</span>
          </div>
        </div>

        <div className={styles.section}>
          <p className={styles.label}>Access Permissions</p>
          <div className={styles.permissions}>
            {assignment.permissions.map((permission) => (
              <span key={permission} className={styles.permission}>
                {permission}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden
      className={styles.icon}
    >
      <path
        d="M7 4V2m10 2V2m-9 8h8m-9 12h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
