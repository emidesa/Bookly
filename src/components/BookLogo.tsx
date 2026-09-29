import type { JSX } from 'react';
import { View } from 'react-native';

interface BookLogoProps {
  size: number; // côté du carré, en points
  color: string;
}

// Mesures du logo du splash (AnimatedSplash), pour un carré de 64
const BASE_SIZE = 64;
const BOOK_WIDTH = 11;
const SHELF_HEIGHT = 5;
const books = [
  { left: 6, height: 50, rotation: '0deg' },
  { left: 21, height: 54, rotation: '0deg' },
  { left: 40, height: 50, rotation: '-18deg' },
];

// Logo Bookly fixe : trois livres sur une étagère (même dessin que le splash)
export default function BookLogo({ size, color }: BookLogoProps): JSX.Element {
  // Toutes les mesures sont proportionnelles à la taille demandée
  const scale = size / BASE_SIZE;

  return (
    <View style={{ width: size, height: size }} accessible={false} importantForAccessibility="no-hide-descendants">
      {books.map((book) => (
        <View
          key={book.left}
          style={{
            position: 'absolute',
            bottom: (SHELF_HEIGHT + 1) * scale,
            left: book.left * scale,
            width: BOOK_WIDTH * scale,
            height: book.height * scale,
            backgroundColor: color,
            transform: [{ rotate: book.rotation }],
          }}
        />
      ))}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: size,
          height: SHELF_HEIGHT * scale,
          backgroundColor: color,
        }}
      />
    </View>
  );
}
