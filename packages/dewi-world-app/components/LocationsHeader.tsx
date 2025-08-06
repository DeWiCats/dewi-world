import HeartOutlined from '@/assets/svgs/heartOutlined.svg';
import LeftArrow from '@/assets/svgs/leftArrow.svg';
import { Theme } from '@/constants/theme';
import { useTabsStore } from '@/stores/useTabsStore';
import { BoxProps } from '@shopify/restyle';
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Box from './ui/Box';
import TouchableContainer from './ui/TouchableContainer';

type LocationsHeaderProps = BoxProps<Theme> & {
  onExit: () => void;
  onLike: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function LocationsHeader({ onExit, onLike, style, ...rest }: LocationsHeaderProps) {
  const { headerVisible } = useTabsStore();

  return (
    <>
      {!headerVisible && (
        <Box width="100%" flexDirection={'row'} justifyContent={'space-between'}>
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
        </Box>
      )}
    </>
  );
}
