import Image from "next/image";
import styles from "./HeaderBar.module.css";
import { UserMenu } from "../UserMenu/UserMenu";

const LOGO_SRC = "/shared/logos/AtomX_Logo.svg";

export function HeaderBar({ user }) {
  return (
    <header className={styles.header}>
      <div className={styles.logoStack}>
        <Image
          src={LOGO_SRC}
          alt="AtomX logo"
          width={160}
          height={42}
          priority
        />
        <div className={styles.meta}>
          <span className={styles.badge}>Unified Access</span>
          <p>AtomX Control Surface</p>
        </div>
      </div>

      <UserMenu user={user} />
    </header>
  );
}
