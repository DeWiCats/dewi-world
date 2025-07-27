import ButtonPressable from '@/components/ButtonPressable';
import Box from '@/components/ui/Box';
import Text from '@/components/ui/Text';
import { Camera, MapView, setAccessToken, StyleImport } from '@rnmapbox/maps';
import { Link } from 'expo-router';
import React from 'react';

setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN as string);

export default function WelcomeScreen() {
  const DEFAULT_ZOOM_LEVEL = 1.5;

  return (
    <Box
      backgroundColor={'blue.dark-950'}
      flex={1}
      alignItems={'center'}
      justifyContent={'space-between'}
    >
      <MapView
        zoomEnabled={false}
        styleURL="mapbox://styles/mapbox/standard-beta"
        style={{ flex: 1, position: 'absolute', width: '100%', height: '100%' }}
        scaleBarEnabled={false}
        compassEnabled={false}
        logoEnabled={false}
        projection="globe"
      >
        <StyleImport
          id="basemap"
          existing
          config={{
            lightPreset: 'night',
          }}
        />
        <Camera zoomLevel={DEFAULT_ZOOM_LEVEL} />
      </MapView>
      <Text
        marginTop="56"
        variant="riolaTitle"
        color="text.white"
        textAlign={'center'}
        textTransform={'uppercase'}
        width={'70%'}
      >
        Welcome to Dewi World
      </Text>

      <Box width={'100%'} paddingHorizontal={'xl'} gap="xl" marginBottom={'5'}>
        <Link href="/(auth)/CreateAccountScreen" asChild>
          <ButtonPressable
            width={'100%'}
            backgroundColor={'base.white'}
            titleColor="base.black"
            title="Create New Account"
            fontSize={16}
            fontWeight="bold"
          />
        </Link>

        <Link href="/(auth)/LoginScreen" asChild>
          <ButtonPressable
            width={'100%'}
            backgroundColor={'base.black'}
            titleColor="base.white"
            title="Login"
            fontSize={16}
            fontWeight="bold"
          />
        </Link>
      </Box>
    </Box>
  );
}
