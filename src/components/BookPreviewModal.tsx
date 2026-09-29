import type { JSX } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BookCover from './BookCover';
import LibraryButton from './LibraryButton';
import { serifFont } from '../theme/fonts';
import { useThemeColors } from '../theme/useThemeColors';
import { GoogleBookResult } from '../types/book';

interface BookPreviewModalProps {
  book: GoogleBookResult | null; // null = modale fermée
  inLibrary: boolean;
  isAdding: boolean;
  onAdd: () => void;
  onRemove: () => void;
  onClose: () => void;
}

// Résumé d'un livre dans une feuille en bas de l'écran, à la hauteur de son contenu (85 % maximum)
export default function BookPreviewModal({ book, inLibrary, isAdding, onAdd, onRemove, onClose }: BookPreviewModalProps): JSX.Element {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={book !== null}
      transparent={true} // on voit l'écran derrière, assombri
      animationType="fade"
      onRequestClose={onClose} // bouton retour Android
      statusBarTranslucent={true} // Android : le fond sombre passe sous la barre d'état
      navigationBarTranslucent={true} // Android : la feuille descend jusqu'au bord de l'écran
    >
      {book !== null && (
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          {/* Appui en dehors de la feuille : fermeture */}
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" accessibilityLabel="Fermer le résumé" />

          <Animated.View
            entering={SlideInDown.duration(280)}
            style={[styles.sheet, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}
            accessibilityViewIsModal={true}
          >
            <View style={[styles.grabber, { backgroundColor: colors.separator }]} />

            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: colors.textSecondary }]} accessibilityRole="header">
                Résumé du livre
              </Text>
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Fermer le résumé"
                hitSlop={8}
                style={[styles.closeButton, { backgroundColor: colors.surfaceElevated }]}
              >
                <SymbolView name={{ ios: 'xmark', android: 'close' }} size={16} tintColor={colors.text} />
              </Pressable>
            </View>

            {/* flexGrow: 0 : la zone prend la hauteur du texte, et défile seulement si c'est trop long */}
            <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
              <View style={styles.top}>
                <BookCover title={book.title} author={book.author} coverUrl={book.cover_url} width={110} />
                <View style={styles.info}>
                  <Text style={[styles.title, { color: colors.text }]}>{book.title}</Text>
                  {book.author !== null && <Text style={[styles.author, { color: colors.textSecondary }]}>{book.author}</Text>}
                  {book.total_pages !== null && (
                    <View style={styles.pagesRow}>
                      <SymbolView name={{ ios: 'doc.text', android: 'description' }} size={18} tintColor={colors.textSecondary} />
                      <Text style={[styles.pages, { color: colors.textSecondary }]}>{book.total_pages + ' pages'}</Text>
                    </View>
                  )}
                </View>
              </View>

              <Text style={[styles.sectionTitle, { color: colors.text }]} accessibilityRole="header">
                Résumé
              </Text>
              {book.description !== null ? (
                <Text style={[styles.description, { color: colors.text }]}>{book.description}</Text>
              ) : (
                <Text style={[styles.description, { color: colors.textSecondary }]}>Aucun résumé disponible pour ce livre.</Text>
              )}
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: colors.separator }]}>
              <LibraryButton bookTitle={book.title} inLibrary={inLibrary} isAdding={isAdding} onAdd={onAdd} onRemove={onRemove} />
            </View>
          </Animated.View>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end', // feuille collée en bas
  },
  sheet: {
    maxHeight: '85%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    marginTop: 10,
  },
  header: {
    alignItems: 'center', // titre centré
    justifyContent: 'center',
    minHeight: 48,
    marginTop: 4,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute', // à droite, sans décentrer le titre
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flexGrow: 0,
  },
  content: {
    padding: 20,
  },
  top: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  info: {
    flex: 1,
    marginLeft: 20,
    justifyContent: 'center',
  },
  title: {
    fontFamily: serifFont,
    fontSize: 24,
    fontWeight: '700',
  },
  author: {
    fontSize: 16,
    marginTop: 8,
  },
  pagesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  pages: {
    fontSize: 15,
    marginLeft: 8,
  },
  sectionTitle: {
    fontFamily: serifFont,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  footer: {
    alignItems: 'center', // bouton centré
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
});
