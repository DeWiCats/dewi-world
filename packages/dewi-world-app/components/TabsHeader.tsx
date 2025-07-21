import { Theme } from '@/constants/theme';
import DrawerMenu from '@assets/svgs/drawer-menu.svg';
import { BoxProps } from '@shopify/restyle';
import React from 'react';
import Box from './ui/Box';
import ImageBox from './ui/ImageBox';
import TouchableContainer from './ui/TouchableContainer';

export default function TabsHeader(props: BoxProps<Theme>) {
  return (
    <Box
      {...props}
      flex={1}
      width={'100%'}
      paddingVertical={'2xl'}
      flexDirection={'row'}
      justifyContent={'space-between'}
      paddingHorizontal={'2xl'}
    >
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
      >
        <DrawerMenu width={30} height={30} />
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
        borderColor="dewiPink"
      >
        <ImageBox
          source={require('@assets/images/profile-pic.png')}
          width={30}
          height={30}
          borderRadius={'full'}
        />
      </TouchableContainer>
    </Box>
  );
}
