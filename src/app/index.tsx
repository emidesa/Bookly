import type { JSX } from 'react';
import { Redirect } from 'expo-router';

// Point d'entrée : redirigera selon la connexion et le rôle (Personne B)
export default function Index(): JSX.Element {
  // PROVISOIRE : en attendant le Login (Personne B), remettre "/auth/login"
  return <Redirect href="/reader/library" />;
}
