import { createBox } from '@shopify/restyle';
import { Image, ImageProps } from 'react-native';

import { Theme } from '@/constants/theme';

const ImageBox = createBox<Theme, ImageProps>(Image);

export default ImageBox;
