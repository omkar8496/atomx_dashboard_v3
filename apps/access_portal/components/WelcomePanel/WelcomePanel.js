import styles from "./WelcomePanel.module.css";

export function WelcomePanel({ user, actions = [] }) {
  return (
    <section className={styles.panel}>
      <div>
        <p className={styles.subhead}>Unified access portal</p>
        <h1 className={styles.heading}>Welcome {user.name}</h1>
        <p className={styles.helper}>
          Choose a module to jump straight into your workspace.
        </p>
      </div>
      <div className={styles.actions}>
        {actions.length === 0 ? (
          <span className="text-sm text-slate-500">Modules will appear after you log in.</span>
        ) : (
          actions.map((action) => (
            <button
              type="button"
              key={action.label}
              className={`${styles.actionButton} ${styles[action.variant]}`}
            >
              {action.label}
            </button>
          ))
        )}
      </div>
    </section>
  );
}
