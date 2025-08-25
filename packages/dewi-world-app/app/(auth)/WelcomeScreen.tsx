import ButtonPressable from '@/components/ButtonPressable';
import Box from '@/components/ui/Box';
import Text from '@/components/ui/Text';
import { Camera, MapView, setAccessToken } from '@rnmapbox/maps';
import { Link } from 'expo-router';
import React, { useEffect, useRef } from 'react';

const mapboxToken = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
if (mapboxToken) {
  setAccessToken(mapboxToken);
}

export default function WelcomeScreen() {
  const DEFAULT_ZOOM_LEVEL = 1.5;
  const cameraRef = useRef<Camera>(null);
  const currentHeading = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const spinGlobe = () => {
      // Increment heading by 3 degrees per second (360 degrees in 120 seconds)
      currentHeading.current += 3;

      // Keep heading in 0-360 range
      if (currentHeading.current >= 360) {
        currentHeading.current = 180;
      }

      // Rotate the globe using heading (NOT bearing)
      cameraRef.current?.setCamera({
        heading: currentHeading.current,
        animationDuration: 3000, // 1 second smooth transition
        animationMode: 'linearTo',
      });
    };

    // Start spinning after a short delay
    const startDelay = setTimeout(() => {
      // Run every second
      intervalRef.current = setInterval(spinGlobe, 3000);
    }, 1000);

    // Cleanup
    return () => {
      clearTimeout(startDelay);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

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
        rotateEnabled={false}
        scrollEnabled={false}
        pitchEnabled={false}
      >
        <Camera
          ref={cameraRef}
          zoomLevel={DEFAULT_ZOOM_LEVEL}
          centerCoordinate={[-98.5795, 39.8283]} // Center of the United States
          heading={0} // Starting heading
          animationDuration={0} // No initial animation
        />
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

      <Box width={'100%'} paddingHorizontal={'xl'} gap="xl" marginBottom={'10'}>
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
            marginBottom={'2xl'}
          />
        </Link>
      </Box>
    </Box>
  );
}
