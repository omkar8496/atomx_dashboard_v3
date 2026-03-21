import "../styles/globals.css";
import { useEffect } from "react";
import { initPostHog } from "@atomx/global-components";
import SessionGuard from "../components/Session/SessionGuard";

export default function App({ Component, pageProps }) {
  useEffect(() => {
    initPostHog("access_portal");
  }, []);

  return (
    <>
      <Component {...pageProps} />
      <SessionGuard />
    </>
  );
}
