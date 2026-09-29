import { useColorScheme } from 'react-native';
import { darkColors, lightColors, ThemeColors } from './colors';

// Renvoie la palette selon le réglage de l'iPhone (choix utilisateur à l'étape dark mode)
export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  if (scheme === 'dark') {
    return darkColors;
  }
  return lightColors;
}
