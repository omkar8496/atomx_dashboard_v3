"use client";

import { useState } from "react";
import styles from "./UserMenu.module.css";

export function UserMenu({ user, onSignOut = () => {} }) {
  const [open, setOpen] = useState(false);

  const handleSignOut = () => {
    setOpen(false);
    onSignOut();
  };

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className={styles.avatar}>{user.initials}</div>
        <div className={styles.copy}>
          <span className={styles.name}>{user.name}</span>
          <span className={styles.role}>{user.role}</span>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          className={open ? styles.chevronOpen : styles.chevron}
          aria-hidden
        >
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 9l6 6 6-6"
          />
        </svg>
      </button>
      {open && (
        <div className={styles.dropdown}>
          <div>
            <p>{user.email}</p>
            <small>Signed in from AtomX Access Portal</small>
          </div>
          <button type="button" className={styles.signout} onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
