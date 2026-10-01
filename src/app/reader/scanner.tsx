import { useRef, useState, type JSX } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, Vibration, View } from 'react-native';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useIsFocused } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BookPreviewModal from '../../components/BookPreviewModal';
import PrimaryButton from '../../components/PrimaryButton';
import { useLanguage } from '../../context/LanguageContext';
import { useLibrary } from '../../hooks/useLibrary';
import { ApiError } from '../../services/api';
import { findByIsbn } from '../../services/bookService';
import { cameraColors } from '../../theme/colors';
import { serifFont } from '../../theme/fonts';
import { useThemeColors } from '../../theme/useThemeColors';
import { GoogleBookResult } from '../../types/book';
import { getErrorMessage } from '../../utils/getErrorMessage';

// scanning : caméra active ; searching : recherche du livre ; notFound : message + bouton pour recommencer
type ScanState = 'scanning' | 'searching' | 'notFound';

// Un ISBN-13 fait 13 chiffres et commence par 978 ou 979
function isIsbn(code: string): boolean {
  if (code.length !== 13) {
    return false;
  }
  return code.startsWith('978') || code.startsWith('979');
}

export default function ScannerScreen(): JSX.Element {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const isFocused = useIsFocused(); // caméra éteinte quand on quitte l'onglet
  const [permission, requestPermission] = useCameraPermissions();

  const [scanState, setScanState] = useState<ScanState>('scanning');
  const [message, setMessage] = useState('');
  const [foundBook, setFoundBook] = useState<GoogleBookResult | null>(null);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const library = useLibrary(); // PAL : savoir si un livre y est, l'ajouter, le retirer

  // Bloque tout de suite les lectures en double (la caméra lit le même code plusieurs fois par seconde)
  const isHandlingScan = useRef(false);

  async function handleBarcodeScanned(result: BarcodeScanningResult): Promise<void> {
    if (isHandlingScan.current) {
      return;
    }
    isHandlingScan.current = true;
    Vibration.vibrate(); // retour physique : code lu

    const code = result.data;
    if (!isIsbn(code)) {
      setMessage(t('scanner.notBook'));
      setScanState('notFound');
      return;
    }

    setScanState('searching');
    try {
      // GET /api/google/isbn/:isbn
      setFoundBook(await findByIsbn(code));
    } catch (error) {
      let text = getErrorMessage(error, t('search.unavailable'));
      if (error instanceof ApiError && error.status === 404) {
        text = t('scanner.notFound', { code: code });
      }
      setMessage(text);
      setScanState('notFound');
    }
  }

  // Remet la caméra en lecture
  function scanAgain(): void {
    setFoundBook(null);
    setMessage('');
    setScanState('scanning');
    isHandlingScan.current = false;
  }

  // Autorisation pas encore connue
  if (permission === null) {
    return <View style={[styles.container, { backgroundColor: colors.background }]} />;
  }

  // Caméra non autorisée : explication + bouton
  if (!permission.granted) {
    let buttonLabel = t('scanner.allowCamera');
    let onPress = (): void => {
      void requestPermission();
    };
    // Refus définitif : seul l'utilisateur peut changer ça dans les réglages
    if (!permission.canAskAgain) {
      buttonLabel = t('scanner.openSettings');
      onPress = (): void => {
        void Linking.openSettings();
      };
    }

    return (
      <View style={[styles.container, styles.permission, { backgroundColor: colors.background }]}>
        <SymbolView name={{ ios: 'camera', android: 'photo_camera' }} size={48} tintColor={colors.primary} />
        <Text style={[styles.permissionTitle, { color: colors.text }]} accessibilityRole="header">
          {t('scanner.title')}
        </Text>
        <Text style={[styles.permissionText, { color: colors.textSecondary }]}>
          {t('scanner.permissionText')}
        </Text>
        <View style={styles.permissionButton}>
          <PrimaryButton label={buttonLabel} onPress={onPress} />
        </View>
      </View>
    );
  }

  let frameColor = cameraColors.frame;
  if (scanState !== 'scanning' || foundBook !== null) {
    frameColor = cameraColors.frameDetected;
  }

  // Lecture seulement quand on attend un code (pas pendant une recherche ni avec la fiche ouverte)
  let onScanned: ((result: BarcodeScanningResult) => void) | undefined = undefined;
  if (scanState === 'scanning' && foundBook === null) {
    onScanned = (result) => {
      void handleBarcodeScanned(result);
    };
  }

  let torchLabel = t('scanner.torchOn');
  if (isTorchOn) {
    torchLabel = t('scanner.torchOff');
  }

  return (
    <View style={styles.container}>
      {isFocused && (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={isTorchOn}
          barcodeScannerSettings={{ barcodeTypes: ['ean13'] }} // code-barres des livres
          onBarcodeScanned={onScanned}
          accessible={true}
          accessibilityLabel={t('scanner.cameraLabel')}
        />
      )}

      {/* Consigne en haut */}
      <View style={[styles.topBubble, { backgroundColor: cameraColors.overlay, top: insets.top + 16 }]}>
        <Text style={[styles.topTitle, { color: cameraColors.text }]} accessibilityRole="header">
          {t('scanner.title')}
        </Text>
        <Text style={[styles.topHint, { color: cameraColors.text }]}>{t('scanner.hint')}</Text>
      </View>

      {/* Cadre de visée (décoratif) */}
      <View style={styles.frameArea} pointerEvents="none" importantForAccessibility="no-hide-descendants">
        <View style={[styles.frame, { borderColor: frameColor }]} />
      </View>

      {/* Recherche en cours */}
      {scanState === 'searching' && foundBook === null && (
        <View style={[styles.statusBubble, { backgroundColor: cameraColors.overlay, bottom: insets.bottom + 180 }]}>
          <ActivityIndicator color={cameraColors.text} />
          <Text style={[styles.statusText, { color: cameraColors.text }]}>{t('scanner.searching')}</Text>
        </View>
      )}

      {/* Code invalide ou livre introuvable */}
      {scanState === 'notFound' && (
        <View style={[styles.notFoundCard, { backgroundColor: colors.surface, bottom: insets.bottom + 110 }]}>
          <Text style={[styles.notFoundText, { color: colors.text }]} accessibilityRole="alert">
            {message}
          </Text>
          <View style={styles.scanAgainButton}>
            <PrimaryButton label={t('scanner.scanAgain')} onPress={scanAgain} />
          </View>
        </View>
      )}

      {/* Lampe torche */}
      {scanState === 'scanning' && (
        <Pressable
          onPress={() => setIsTorchOn(!isTorchOn)}
          accessibilityRole="button"
          accessibilityLabel={torchLabel}
          accessibilityState={{ selected: isTorchOn }}
          style={[styles.torchButton, { backgroundColor: cameraColors.overlay, bottom: insets.bottom + 110 }]}
        >
          <SymbolView
            name={isTorchOn ? { ios: 'flashlight.on.fill', android: 'flashlight_on' } : { ios: 'flashlight.off.fill', android: 'flashlight_off' }}
            size={24}
            tintColor={cameraColors.text}
          />
        </Pressable>
      )}

      {/* Fiche du livre trouvé (même modale que la recherche) */}
      <BookPreviewModal
        book={foundBook}
        inLibrary={foundBook !== null && library.isInLibrary(foundBook.google_id)}
        isAdding={foundBook !== null && library.addingId === foundBook.google_id}
        onAdd={() => {
          if (foundBook !== null) {
            void library.add(foundBook);
          }
        }}
        onRemove={() => {
          if (foundBook !== null) {
            library.confirmRemove(foundBook);
          }
        }}
        onClose={scanAgain}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cameraColors.background,
  },
  permission: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  permissionTitle: {
    fontFamily: serifFont,
    fontSize: 26,
    fontWeight: '700',
    marginTop: 20,
  },
  permissionText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 12,
  },
  permissionButton: {
    marginTop: 28,
  },
  topBubble: {
    position: 'absolute',
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
  },
  topTitle: {
    fontFamily: serifFont,
    fontSize: 22,
    fontWeight: '700',
  },
  topHint: {
    fontSize: 15,
    marginTop: 4,
  },
  frameArea: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: 280,
    height: 170,
    borderWidth: 3,
    borderRadius: 20,
  },
  statusBubble: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
  },
  notFoundCard: {
    position: 'absolute',
    left: 20,
    right: 20,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 16,
    textAlign: 'center',
  },
  scanAgainButton: {
    marginTop: 16,
  },
  torchButton: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
