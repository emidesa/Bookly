// Couleurs disponibles dans chaque thème
export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  primary: string;
  onPrimary: string;
  border: string;
  error: string;
}

// Contrastes vérifiés : WCAG AA (texte >= 4.5, bordures >= 3)
export const lightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F5F1EA',
  text: '#1F1B16',
  textSecondary: '#5C554B',
  primary: '#8A3B12',
  onPrimary: '#FFFFFF',
  border: '#8C8478',
  error: '#B3261E',
};

export const darkColors: ThemeColors = {
  background: '#121212',
  surface: '#1E1C19',
  text: '#F2EDE4',
  textSecondary: '#BDB5A8',
  primary: '#F0A77A',
  onPrimary: '#1F1B16',
  border: '#7A7266',
  error: '#F2B8B5',
};
