import { Theme } from '@/constants/theme';
import React from 'react';
import createText from './createText';

const Text = createText<Theme>();

// eslint-disable-next-line react/display-name
export default (props: TextProps) => <Text maxFontSizeMultiplier={1.3} {...props} />;

export type TextProps = React.ComponentProps<typeof Text>;
