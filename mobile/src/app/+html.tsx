import { ScrollViewStyleReset, useServerDocumentContext } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

// Web-only root HTML for static rendering. Runs in Node at build time;
// no DOM or browser APIs here.
//
// The document context MUST be consumed in full: the client JS entry
// scripts arrive as bodyNodes, and omitting them leaves the page as a
// static shell that never hydrates (the app stuck on "Opening your
// deck…" with no JS loaded at all).
//
// The viewport uses viewport-fit=cover (so safe-area insets are
// reported) and the root is sized to the *dynamic* viewport height:
// on mobile browsers 100vh includes the area under the collapsible URL
// bar, which pushed the bottom tab bar below the visible fold and
// clipped its labels. 100dvh tracks the visible height instead. The
// dvh rule sits last in <head> so it wins over the reset's height:100%.
export default function Root({ children }: PropsWithChildren) {
  const { bodyAttributes, bodyNodes, htmlAttributes, headNodes } = useServerDocumentContext();
  return (
    <html lang="en" {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <ScrollViewStyleReset />
        {headNodes}
        <style>{`html, body, #root { height: 100%; height: 100dvh; }`}</style>
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}
