import { Theme } from '@/constants/theme';
// import DrawerMenu from '@assets/svgs/drawer-menu.svg';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { BoxProps } from '@shopify/restyle';
import React from 'react';
import Box from './ui/Box';
import ImageBox from './ui/ImageBox';
import TouchableContainer from './ui/TouchableContainer';

export default function TabsHeader(props: BoxProps<Theme>) {
  const { showSettings } = useSettingsStore();

  return (
    <Box
      position={'absolute'}
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      flexDirection={'row'}
      justifyContent={'flex-end'}
      alignItems={'flex-end'}
      paddingHorizontal={'6'}
      paddingTop={'7xl'}
      paddingBottom={'6'}
      {...props}
    >
      <Box>
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
          borderColor="dewiPink"
          onPress={showSettings}
        >
          <ImageBox
            source={require('@assets/images/profile-pic.png')}
            width={30}
            height={30}
            borderRadius={'full'}
          />
        </TouchableContainer>
      </Box>
    </Box>
  );
}
