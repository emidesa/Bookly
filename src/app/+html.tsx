import type { JSX, PropsWithChildren } from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';

// Page HTML de la version web uniquement : déclare le français (lecteurs d'écran, traduction)
export default function Root({ children }: PropsWithChildren): JSX.Element {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        {/* Réglages par défaut d'Expo pour que les ScrollView défilent bien sur le web */}
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
