import { ActionSheetIOS, Alert, Platform } from 'react-native';
import { translate } from '../i18n/i18n';

// Menu de choix natif : feuille en bas sur iPhone, boîte de dialogue sur Android
// Le choix actuel est marqué d'un ✓ ; onSelect reçoit l'index choisi
export function showOptionsMenu(title: string, options: string[], selectedIndex: number, onSelect: (index: number) => void): void {
  const labels: string[] = [];
  for (let i = 0; i < options.length; i = i + 1) {
    if (i === selectedIndex) {
      labels.push(options[i] + ' ✓');
    } else {
      labels.push(options[i]);
    }
  }

  if (Platform.OS === 'ios') {
    const iosOptions = labels.concat([translate('common.cancel')]);
    ActionSheetIOS.showActionSheetWithOptions(
      { title: title, options: iosOptions, cancelButtonIndex: labels.length },
      (index) => {
        if (index < labels.length) {
          onSelect(index);
        }
      },
    );
    return;
  }

  // Android : 3 boutons maximum, un appui en dehors ferme la boîte
  const buttons = labels.map((label, index) => {
    return { text: label, onPress: () => onSelect(index) };
  });
  Alert.alert(title, undefined, buttons, { cancelable: true });
}
