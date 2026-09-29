import { Platform } from 'react-native';

// Police à empattements des titres (Georgia est présente sur iPhone)
export const serifFont = Platform.select({ ios: 'Georgia', default: 'serif' });
