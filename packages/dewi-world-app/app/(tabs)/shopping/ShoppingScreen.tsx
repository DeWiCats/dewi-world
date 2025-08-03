import ButtonPressable from '@/components/ButtonPressable';
import SafeAreaBox from '@/components/SafeAreaBox';
import Text from '@/components/ui/Text';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { View } from 'react-native';

export default function ShoppingScreen() {
  const handleShopNowPress = async () => {
    await WebBrowser.openBrowserAsync('https://shop.dewicats.com/');
  };

  return (
    <SafeAreaBox
      padding="2xl"
      justifyContent={'space-between'}
      backgroundColor={'primaryBackground'}
      flex={1}
    >
      <Image
        source={require('@assets/images/dewi-drip.gif')}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          //   transform: [{ translateY: -250 }],
        }}
        contentFit="cover"
        priority="high"
      />

      {/* Dimming overlay */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      />

      {/* Content section */}
      <View style={{ alignItems: 'center', gap: 20, zIndex: 1, marginTop: 80 }}>
        <Text color="primaryText" textAlign={'center'} fontWeight={600} variant="riolaTitle">
          DeWi Drip
        </Text>
        <Text variant={'textMdRegular'} color="text.quaternary-500" textAlign={'center'}>
          Gear up with exclusive drip.
        </Text>
      </View>

      {/* Button at bottom */}
      <View style={{ zIndex: 1 }}>
        <ButtonPressable
          title="Shop Now"
          backgroundColor={'base.white'}
          titleColor="base.black"
          marginBottom={'8xl'}
          onPress={handleShopNowPress}
        />
      </View>
    </SafeAreaBox>
  );
}
