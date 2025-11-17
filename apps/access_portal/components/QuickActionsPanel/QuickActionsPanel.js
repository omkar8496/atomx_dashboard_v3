import styles from "./QuickActionsPanel.module.css";
import { QuickActionCard } from "../QuickActionCard/QuickActionCard";

export function QuickActionsPanel({ actions, onAction }) {
  return (
    <section className={styles.panel}>
      <div className={styles.banner}>
        <div>
          <p className={styles.title}>Quick Actions</p>
          <p className={styles.subtitle}>Access your assigned modules</p>
        </div>
      </div>
      <div className={styles.grid}>
        {actions.map((action) => (
          <QuickActionCard
            key={action.title}
            title={action.title}
            description={action.description}
            iconColor={action.color}
            onClick={() => onAction?.(action)}
          />
        ))}
      </div>
    </section>
  );
}
