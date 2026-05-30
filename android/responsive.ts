import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base de conception (iPhone 11/X par exemple) : 375x812
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

/**
 * Scale pour les largeurs, marges horizontales, etc.
 */
export const horizontalScale = (size: number) => (SCREEN_WIDTH / guidelineBaseWidth) * size;

/**
 * Scale pour les hauteurs, marges verticales, etc.
 */
export const verticalScale = (size: number) => (SCREEN_HEIGHT / guidelineBaseHeight) * size;

/**
 * Scale modéré pour les polices et arrondis (évite d'être trop grand sur tablettes)
 */
export const moderateScale = (size: number, factor = 0.5) => 
  size + (horizontalScale(size) - size) * factor;

export { SCREEN_WIDTH, SCREEN_HEIGHT };