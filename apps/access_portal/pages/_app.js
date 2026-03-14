import "../styles/globals.css";
import SessionGuard from "../components/Session/SessionGuard";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <SessionGuard />
    </>
  );
}
