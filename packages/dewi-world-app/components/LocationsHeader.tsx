import HeartOutlined from '@/assets/svgs/heartOutlined.svg';
import LeftArrow from '@/assets/svgs/leftArrow.svg';
import { Theme } from '@/constants/theme';
import { BoxProps } from '@shopify/restyle';
import React from 'react';
import { ReAnimatedBox } from './ui/Box';
import TouchableContainer from './ui/TouchableContainer';

type LocationsHeaderProps = BoxProps<Theme> & {
  onExit: () => void;
  onLike: () => void;
};

export default function LocationsHeader({ onExit, onLike, ...rest }: LocationsHeaderProps) {
  return (
    <ReAnimatedBox
      {...rest}
      flex={1}
      zIndex={1}
      width={'100%'}
      position={'absolute'}
      backgroundColor={'transparent'}
      paddingVertical={'2xl'}
      flexDirection={'row'}
      justifyContent={'space-between'}
      paddingHorizontal={'2xl'}
    >
      <TouchableContainer
        onPress={onExit}
        justifyContent={'center'}
        alignItems={'center'}
        padding={'4'}
        borderRadius={'full'}
        width={48}
        height={48}
        defaultBackground={'base.black'}
        pressedBackgroundColor={'gray.900'}
        pressableStyles={{
          flex: undefined,
        }}
        shadowColor={'base.black'}
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.25}
        shadowRadius={3.84}
        elevation={5}
      >
        <LeftArrow width={20} height={20} />
      </TouchableContainer>
      <TouchableContainer
        justifyContent={'center'}
        alignItems={'center'}
        padding={'4'}
        borderRadius={'full'}
        width={48}
        height={48}
        defaultBackground={'base.black'}
        pressedBackgroundColor={'gray.900'}
        pressableStyles={{
          flex: undefined,
        }}
        shadowColor={'base.black'}
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.25}
        shadowRadius={3.84}
        elevation={5}
        borderWidth={1}
      >
        <HeartOutlined width={25} height={25} />
      </TouchableContainer>
    </ReAnimatedBox>
  );
}
