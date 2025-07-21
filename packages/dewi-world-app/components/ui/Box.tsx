import { Theme } from '@/constants/theme';
import { createBox } from '@shopify/restyle';
import ReAnimated from 'react-native-reanimated';

const Box = createBox<Theme>();

export default Box;

export const ReAnimatedBox = ReAnimated.createAnimatedComponent(Box);
