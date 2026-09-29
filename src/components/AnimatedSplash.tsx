import { useEffect, type JSX } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { splashColors } from '../theme/colors';
import { serifFont } from '../theme/fonts';

interface AnimatedSplashProps {
  onFinish: () => void; // appelé quand le splash a disparu
}

const TOTAL_DURATION = 2800;

// Un livre qui monte sur l'étagère après un délai
function AnimatedBook({ delay, style, rotation }: { delay: number; style: ViewStyle; rotation: string }): JSX.Element {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (!reduceMotion) {
      progress.value = withDelay(delay, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }));
    }
    // Une seule fois, à l'affichage
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      transform: [{ translateY: (1 - progress.value) * 30 }, { rotate: rotation }],
    };
  });

  return <Animated.View style={[styles.book, style, animatedStyle]} />;
}

export default function AnimatedSplash({ onFinish }: AnimatedSplashProps): JSX.Element {
  const reduceMotion = useReducedMotion();

  // Avec « Réduire les animations », tout est visible directement
  let startValue = 0;
  if (reduceMotion) {
    startValue = 1;
  }

  const gradientOpacity = useSharedValue(startValue);
  const shelfOpacity = useSharedValue(startValue);
  const titleOpacity = useSharedValue(startValue);
  const taglineOpacity = useSharedValue(startValue);
  const splashOpacity = useSharedValue(1);

  useEffect(() => {
    // Le splash natif (fond uni) laisse la place à celui-ci
    SplashScreen.hideAsync();

    if (!reduceMotion) {
      gradientOpacity.value = withTiming(1, { duration: 400 });
      shelfOpacity.value = withDelay(100, withTiming(1, { duration: 300 }));
      titleOpacity.value = withDelay(900, withTiming(1, { duration: 500 }));
      taglineOpacity.value = withDelay(1300, withTiming(1, { duration: 500 }));
    }
    splashOpacity.value = withDelay(2400, withTiming(0, { duration: 400 }));

    const timer = setTimeout(onFinish, TOTAL_DURATION);
    return () => clearTimeout(timer);
    // Une seule fois, à l'affichage (sinon le minuteur redémarre)
  }, []);

  const gradientStyle = useAnimatedStyle(() => {
    return { opacity: gradientOpacity.value };
  });
  const shelfStyle = useAnimatedStyle(() => {
    return { opacity: shelfOpacity.value };
  });
  const titleStyle = useAnimatedStyle(() => {
    return { opacity: titleOpacity.value, transform: [{ translateX: (1 - titleOpacity.value) * -12 }] };
  });
  const taglineStyle = useAnimatedStyle(() => {
    return { opacity: taglineOpacity.value };
  });
  const splashStyle = useAnimatedStyle(() => {
    return { opacity: splashOpacity.value };
  });

  return (
    <Animated.View
      style={[styles.container, splashStyle]}
      accessible={true}
      accessibilityLabel="Bookly, Vos lectures, précieusement gardées."
    >
      <Animated.View style={[StyleSheet.absoluteFill, gradientStyle]}>
        <LinearGradient
          colors={[splashColors.gradientTop, splashColors.gradientBottom]}
          start={{ x: 0.6, y: 0 }}
          end={{ x: 0.5, y: 0.7 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <View style={styles.brand}>
        {/* Logo : trois livres sur une étagère */}
        <View style={styles.logo}>
          <AnimatedBook delay={200} rotation="0deg" style={styles.bookOne} />
          <AnimatedBook delay={350} rotation="0deg" style={styles.bookTwo} />
          <AnimatedBook delay={500} rotation="-18deg" style={styles.bookThree} />
          <Animated.View style={[styles.shelf, shelfStyle]} />
        </View>

        <Animated.Text style={[styles.title, titleStyle]}>Bookly</Animated.Text>
      </View>

      <Animated.Text style={[styles.tagline, taglineStyle]}>Vos lectures, précieusement gardées.</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: splashColors.gradientBottom,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 64,
    height: 64,
    marginRight: 20,
  },
  book: {
    position: 'absolute',
    bottom: 6,
    width: 11,
    backgroundColor: splashColors.text,
  },
  bookOne: {
    left: 6,
    height: 50,
  },
  bookTwo: {
    left: 21,
    height: 54,
  },
  bookThree: {
    left: 40,
    height: 50,
  },
  shelf: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 64,
    height: 5,
    backgroundColor: splashColors.text,
  },
  title: {
    fontFamily: serifFont,
    fontSize: 52,
    fontWeight: '700',
    color: splashColors.text,
  },
  tagline: {
    fontFamily: serifFont,
    fontSize: 17,
    fontWeight: '600',
    color: splashColors.tagline,
    marginTop: 28,
  },
});
