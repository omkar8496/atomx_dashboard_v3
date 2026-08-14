import { Html, Head, Main, NextScript } from "next/document";

// Applies the saved theme before first paint to avoid a light/dark flash.
const THEME_BOOT = `
try {
  var t = localStorage.getItem('atomx.theme');
  if (t === 'dark') document.documentElement.setAttribute('data-atx', 'dark');
} catch (e) {}
`;

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
