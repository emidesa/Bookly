// Couleurs disponibles dans chaque thème (palette Figma Bookly)
export interface ThemeColors {
  background: string; // fond global
  surface: string; // cartes
  surfaceElevated: string; // sections, surfaces élevées
  text: string;
  textSecondary: string;
  primary: string;
  onPrimary: string; // texte sur un bouton primaire
  primaryPressed: string; // bouton primaire appuyé
  primarySoft: string; // fond de badge
  accent: string; // fond des boutons ambre (jamais en couleur de texte)
  onAccent: string; // texte sur un bouton ambre
  accentSoft: string; // fond de chip
  accentText: string; // texte ambre lisible
  separator: string; // séparateurs décoratifs uniquement
  inputBorder: string; // contour des champs (contraste >= 3)
  error: string;
}

// Contrastes vérifiés : WCAG AA (texte >= 4.5, contours >= 3)
export const lightColors: ThemeColors = {
  background: '#FAF7F2',
  surface: '#FFFFFF',
  surfaceElevated: '#F0EBE3',
  text: '#1A1A2E',
  textSecondary: '#626280', // Figma #6B6B8A foncé pour AA
  primary: '#3D2C8D',
  onPrimary: '#FFFFFF',
  primaryPressed: '#2A1E6B',
  primarySoft: '#EDE9F8',
  accent: '#F2A541',
  onAccent: '#1A1A2E',
  accentSoft: '#FEF3DC',
  accentText: '#9A5F0E', // Figma #C47F1A foncé pour AA
  separator: '#E8E4DE',
  inputBorder: '#8E8A9E',
  error: '#B3261E',
};

export const darkColors: ThemeColors = {
  background: '#0F0E1A',
  surface: '#1C1A2E',
  surfaceElevated: '#252340',
  text: '#F0EBE3',
  textSecondary: '#9B9AB8',
  primary: '#B3A6F2', // indigo clair : #3D2C8D illisible sur fond sombre
  onPrimary: '#0F0E1A',
  primaryPressed: '#9D8EEA',
  primarySoft: '#2E2A55',
  accent: '#F2A541',
  onAccent: '#1A1A2E',
  accentSoft: '#3A2E1A',
  accentText: '#F2A541',
  separator: '#2E2B45',
  inputBorder: '#6E6B8C',
  error: '#F2B8B5',
};

// Splashscreen : identique en clair et en sombre
export const splashColors = {
  gradientTop: '#5B46B8',
  gradientBottom: '#2A1E6B', // aussi dans app.json (splash natif)
  text: '#FFFFFF',
  tagline: '#EDE9F8',
};
