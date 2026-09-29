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
  errorSoft: string; // fond du bouton supprimer
  // Badges de statut (fond + texte)
  badgeToReadBackground: string;
  badgeToReadText: string;
  badgeReadingBackground: string;
  badgeReadingText: string;
  badgeReadBackground: string;
  badgeReadText: string;
  progressTrack: string; // fond de la barre de progression
  shadow: string; // ombre des couvertures
  tabBarBackground: string; // barre d'onglets si l'effet verre n'est pas disponible
  tabBarBorder: string;
  tabActiveBackground: string; // pastille de l'onglet actif
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
  errorSoft: '#FBE9E9',
  badgeToReadBackground: '#F0EBE3',
  badgeToReadText: '#1A1A2E',
  badgeReadingBackground: '#FEF3DC',
  badgeReadingText: '#9A5F0E',
  badgeReadBackground: '#E3F1E7',
  badgeReadText: '#2F6B45',
  progressTrack: '#E8E4DE',
  shadow: '#1A1A2E',
  tabBarBackground: 'rgba(250, 247, 242, 0.92)', // Figma : nav bar glassy
  tabBarBorder: 'rgba(61, 44, 141, 0.08)',
  tabActiveBackground: '#FFFFFF',
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
  errorSoft: '#3A1F24',
  badgeToReadBackground: '#252340',
  badgeToReadText: '#F0EBE3',
  badgeReadingBackground: '#3A2E1A',
  badgeReadingText: '#F2A541',
  badgeReadBackground: '#1F3328',
  badgeReadText: '#8FD4A6',
  progressTrack: '#2E2B45',
  shadow: '#000000',
  tabBarBackground: 'rgba(28, 26, 46, 0.92)',
  tabBarBorder: 'rgba(179, 166, 242, 0.12)',
  tabActiveBackground: '#252340',
};

// Splashscreen : identique en clair et en sombre
export const splashColors = {
  gradientTop: '#5B46B8',
  gradientBottom: '#2A1E6B', // aussi dans app.json (splash natif)
  text: '#FFFFFF',
  tagline: '#EDE9F8',
};
