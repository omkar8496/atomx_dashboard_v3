import { useEffect, useState } from "react";
import Image from "next/image";
import { UserMenu } from "../UserMenu/UserMenu";

const LOGO_SRC = "/shared/logos/AtomX_Logo.svg";
const THEME_KEY = "atomx.theme";

function useTheme() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    if (typeof document === "undefined") return;
    const current =
      document.documentElement.getAttribute("data-atx") === "dark"
        ? "dark"
        : "light";
    setTheme(current);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      if (typeof document !== "undefined") {
        if (next === "dark") {
          document.documentElement.setAttribute("data-atx", "dark");
        } else {
          document.documentElement.removeAttribute("data-atx");
        }
      }
      try {
        window.localStorage.setItem(THEME_KEY, next);
      } catch (err) {
        /* ignore storage failures */
      }
      return next;
    });
  };

  return { theme, toggleTheme };
}

export function HeaderBar({ user, onSignOut, pageTitle = "Workspace" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      style={{
        "--header-h": "58px",
        "--crumb-h": "0px",
        "--header-total-h": "var(--header-h)"
      }}
    >
      <div className="fixed left-0 right-0 top-0 z-40">
        <header
          className="w-full border-b border-(--line) bg-(--surface) text-(--text) shadow-(--shadow)"
          style={{ height: "var(--header-h)" }}
        >
          <div className="flex h-full items-center gap-3 px-4 md:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="relative block h-[40px] w-[100px] shrink-0 overflow-hidden">
                <Image
                  src={LOGO_SRC}
                  alt="AtomX logo"
                  width={150}
                  height={150}
                  priority
                  className="absolute -left-[28px] -top-[52px] h-[132px] w-[150px] max-w-none"
                />
              </span>
              <div className="hidden h-9 w-px bg-(--line) sm:block" aria-hidden />
              <div className="font-chillax flex min-w-0 items-center gap-2 text-[1.3rem] font-semibold leading-none sm:text-[1.45rem]">
                <span className="hidden truncate text-(--text) sm:inline">Portal</span>
                <span className="hidden text-(--faint) sm:inline">/</span>
                <span className="truncate text-(--orange)">{pageTitle}</span>
              </div>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={toggleTheme}
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                aria-pressed={isDark}
                className="font-vcr flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-(--line) bg-(--surface) text-[11px] tracking-[0.06em] text-(--muted) transition hover:border-(--orange) hover:text-(--text)"
              >
                {isDark ? "LT" : "DK"}
              </button>
              <UserMenu user={user} onSignOut={onSignOut} />
            </div>
          </div>
        </header>
      </div>
      <div style={{ height: "var(--header-total-h)" }} />
    </div>
  );
}
