import { useRef, useState, type JSX } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, StyleSheet, Text, Vibration, View } from 'react-native';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useIsFocused } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BookPreviewModal from '../../components/BookPreviewModal';
import { sampleBooks } from '../../data/sampleBooks';
import { sampleFindByIsbn } from '../../data/sampleGoogleBooks';
import { cameraColors } from '../../theme/colors';
import { serifFont } from '../../theme/fonts';
import { useThemeColors } from '../../theme/useThemeColors';
import { GoogleBookResult } from '../../types/book';

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
  const isFocused = useIsFocused(); // caméra éteinte quand on quitte l'onglet
  const [permission, requestPermission] = useCameraPermissions();

  const [scanState, setScanState] = useState<ScanState>('scanning');
  const [message, setMessage] = useState('');
  const [foundBook, setFoundBook] = useState<GoogleBookResult | null>(null);
  const [isTorchOn, setIsTorchOn] = useState(false);
  // PROVISOIRE : google_id des livres de la PAL (sera chargé par GET /api/books)
  const [libraryIds, setLibraryIds] = useState<string[]>(sampleBooks.map((book) => book.google_id));

  // Bloque tout de suite les lectures en double (la caméra lit le même code plusieurs fois par seconde)
  const isHandlingScan = useRef(false);

  function handleBarcodeScanned(result: BarcodeScanningResult): void {
    if (isHandlingScan.current) {
      return;
    }
    isHandlingScan.current = true;
    Vibration.vibrate(); // retour physique : code lu

    const code = result.data;
    if (!isIsbn(code)) {
      setMessage("Ce code-barres n'est pas celui d'un livre.");
      setScanState('notFound');
      return;
    }

    setScanState('searching');
    // PROVISOIRE : sera remplacé par GET /api/google/isbn/:isbn
    const book = sampleFindByIsbn(code);
    if (book === null) {
      setMessage('Aucun livre trouvé pour le code ' + code + '.');
      setScanState('notFound');
      return;
    }
    setFoundBook(book);
  }

  // Remet la caméra en lecture
  function scanAgain(): void {
    setFoundBook(null);
    setMessage('');
    setScanState('scanning');
    isHandlingScan.current = false;
  }

  function addToLibrary(book: GoogleBookResult): void {
    // PROVISOIRE : POST /api/books
    setLibraryIds(libraryIds.concat([book.google_id]));
  }

  // Confirmation obligatoire : les sessions du livre sont aussi supprimées
  function removeFromLibrary(book: GoogleBookResult): void {
    Alert.alert('Retirer « ' + book.title + ' » de ta PAL ?', 'Ses sessions de lecture seront aussi supprimées.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Retirer',
        style: 'destructive',
        // PROVISOIRE : DELETE /api/books/:id
        onPress: () => setLibraryIds(libraryIds.filter((id) => id !== book.google_id)),
      },
    ]);
  }

  // Autorisation pas encore connue
  if (permission === null) {
    return <View style={[styles.container, { backgroundColor: colors.background }]} />;
  }

  // Caméra non autorisée : explication + bouton
  if (!permission.granted) {
    let buttonLabel = 'Autoriser la caméra';
    let onPress = (): void => {
      void requestPermission();
    };
    // Refus définitif : seul l'utilisateur peut changer ça dans les réglages
    if (!permission.canAskAgain) {
      buttonLabel = 'Ouvrir les réglages';
      onPress = (): void => {
        void Linking.openSettings();
      };
    }

    return (
      <View style={[styles.container, styles.permission, { backgroundColor: colors.background }]}>
        <SymbolView name={{ ios: 'camera', android: 'photo_camera' }} size={48} tintColor={colors.primary} />
        <Text style={[styles.permissionTitle, { color: colors.text }]} accessibilityRole="header">
          Scanner un livre
        </Text>
        <Text style={[styles.permissionText, { color: colors.textSecondary }]}>
          Autorise la caméra pour scanner le code-barres au dos de tes livres et les ajouter à ta PAL.
        </Text>
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={buttonLabel}
          style={[styles.permissionButton, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.permissionButtonText, { color: colors.onPrimary }]}>{buttonLabel}</Text>
        </Pressable>
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
    onScanned = handleBarcodeScanned;
  }

  let torchLabel = 'Allumer la lampe';
  if (isTorchOn) {
    torchLabel = 'Éteindre la lampe';
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
          accessibilityLabel="Caméra. Place le code-barres au dos du livre dans le cadre."
        />
      )}

      {/* Consigne en haut */}
      <View style={[styles.topBubble, { backgroundColor: cameraColors.overlay, top: insets.top + 16 }]}>
        <Text style={[styles.topTitle, { color: cameraColors.text }]} accessibilityRole="header">
          Scanner un livre
        </Text>
        <Text style={[styles.topHint, { color: cameraColors.text }]}>Place le code-barres dans le cadre</Text>
      </View>

      {/* Cadre de visée (décoratif) */}
      <View style={styles.frameArea} pointerEvents="none" importantForAccessibility="no-hide-descendants">
        <View style={[styles.frame, { borderColor: frameColor }]} />
      </View>

      {/* Recherche en cours */}
      {scanState === 'searching' && foundBook === null && (
        <View style={[styles.statusBubble, { backgroundColor: cameraColors.overlay, bottom: insets.bottom + 180 }]}>
          <ActivityIndicator color={cameraColors.text} />
          <Text style={[styles.statusText, { color: cameraColors.text }]}>Recherche du livre...</Text>
        </View>
      )}

      {/* Code invalide ou livre introuvable */}
      {scanState === 'notFound' && (
        <View style={[styles.notFoundCard, { backgroundColor: colors.surface, bottom: insets.bottom + 110 }]}>
          <Text style={[styles.notFoundText, { color: colors.text }]} accessibilityRole="alert">
            {message}
          </Text>
          <Pressable
            onPress={scanAgain}
            accessibilityRole="button"
            accessibilityLabel="Scanner un autre livre"
            style={[styles.scanAgainButton, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.scanAgainText, { color: colors.onPrimary }]}>Scanner un autre livre</Text>
          </Pressable>
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
        inLibrary={foundBook !== null && libraryIds.includes(foundBook.google_id)}
        isAdding={false}
        onAdd={() => {
          if (foundBook !== null) {
            addToLibrary(foundBook);
          }
        }}
        onRemove={() => {
          if (foundBook !== null) {
            removeFromLibrary(foundBook);
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
    minHeight: 52,
    paddingHorizontal: 28,
    borderRadius: 26,
    justifyContent: 'center',
    marginTop: 28,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '700',
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
    minHeight: 48,
    paddingHorizontal: 24,
    borderRadius: 24,
    justifyContent: 'center',
    marginTop: 16,
  },
  scanAgainText: {
    fontSize: 15,
    fontWeight: '700',
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
