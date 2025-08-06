import LocationsHeader from '@/components/LocationsHeader';
import PriceAndMessageBox from '@/components/PriceAndMessageBox';
import Box, { ReAnimatedBox } from '@/components/ui/Box';
import { fetchLocationsGeoJSON, GeoJSONLocation, GeoJSONResponse } from '@/lib/geojsonAPI';
import { useTabsStore } from '@/stores/useTabsStore';
import { Portal } from '@gorhom/portal';
import {
  Camera,
  CircleLayer,
  MapView,
  setAccessToken,
  ShapeSource,
  StyleImport,
  SymbolLayer,
} from '@rnmapbox/maps';
import { OnPressEvent } from '@rnmapbox/maps/lib/typescript/src/types/OnPressEvent';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WorldDrawer from './WorldDrawer';

setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN as string);

const DEFAULT_ZOOM_LEVEL = 17;
const DEFAULT_RADIUS_KM = 50; // Default radius for location fetching

export default function WorldScreen() {
  // Control globe camera
  const camera = useRef<Camera>(null);
  const map = useRef<MapView>(null);

  const { showHeader, showTabBar, hideHeader, hideTabBar } = useTabsStore();

  const [selectedLocation, setSelectedLocation] = useState<null | GeoJSONLocation>();
  const [fadeIn, setFadeIn] = useState(true);
  const [geoJsonData, setGeoJsonData] = useState<GeoJSONResponse>({
    type: 'FeatureCollection',
    features: [],
  });
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const { bottom } = useSafeAreaInsets();
  const [lastFetchCenter, setLastFetchCenter] = useState<{ lat: number; lng: number } | null>(null);

  const animationDelay = 400;
  const fadeInStyle = useAnimatedStyle(() => {
    if (fadeIn) {
      return {
        opacity: withTiming(1, { duration: animationDelay }),
      };
    }

    return {
      opacity: withTiming(0, { duration: animationDelay }),
    };
  }, [fadeIn]);

  // Request location permissions and get user location
  useEffect(() => {
    async function requestLocationPermission() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          try {
            const location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            setUserLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
            console.log('✅ User location obtained:', {
              lat: location.coords.latitude,
              lng: location.coords.longitude,
            });
          } catch (locationError) {
            console.error('❌ Error getting location:', locationError);
            // Fallback to NYC coordinates if location fails
            console.log('🗽 Using fallback location (NYC)');
            setUserLocation({
              latitude: 40.7829,
              longitude: -73.9654,
            });
          }
        } else {
          console.log('📍 Location permission denied, using fallback location');
          // Use fallback location if permission denied
          setUserLocation({
            latitude: 40.7829,
            longitude: -73.9654,
          });
        }
      } catch (error) {
        console.error('❌ Error requesting location permission:', error);
        // Use fallback location if any error occurs
        setUserLocation({
          latitude: 40.7829,
          longitude: -73.9654,
        });
      }
    }

    requestLocationPermission();
  }, []);

  // Fetch locations based on user location or default area
  const fetchLocations = useCallback(
    async (centerLat?: number, centerLng?: number, radius = DEFAULT_RADIUS_KM) => {
      try {
        setLoading(true);

        const params = {
          latitude: centerLat,
          longitude: centerLng,
          radius_km: radius,
          limit: 100,
        };

        console.log('🌍 Fetching locations with params:', params);
        const geoJson = await fetchLocationsGeoJSON(params);
        console.log('✅ Locations fetched successfully:', geoJson.features.length, 'locations');

        setGeoJsonData(geoJson);

        if (centerLat && centerLng) {
          setLastFetchCenter({ lat: centerLat, lng: centerLng });
        }
      } catch (error) {
        console.error('❌ Error fetching locations:', error);

        // Check if it's an auth error
        if (error instanceof Error && error.message.includes('Authorization')) {
          console.log('🔐 Auth error detected, trying fallback...');
        }

        // Fallback: Try to use legacy static data if API fails
        try {
          console.log('🔄 Attempting fallback to static data...');
          // Import the static geojson as fallback
          const { default: staticGeojson } = await import('@/geojson');
          const { convertLegacyGeoJSON } = await import('@/lib/geojsonAPI');
          const fallbackData = convertLegacyGeoJSON(staticGeojson);
          console.log('✅ Using fallback static data:', fallbackData.features.length, 'locations');
          setGeoJsonData(fallbackData);
        } catch (fallbackError) {
          console.error('❌ Fallback also failed:', fallbackError);
          // Ultimate fallback: empty data
          setGeoJsonData({ type: 'FeatureCollection', features: [] });
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Initial load - fetch locations around user or default location
  useEffect(() => {
    if (userLocation) {
      fetchLocations(userLocation.latitude, userLocation.longitude);
    } else {
      // Default to NYC area if no user location
      fetchLocations(40.7829, -73.9654);
    }
  }, [userLocation, fetchLocations]);

  // Handle map region changes to load new locations dynamically
  const handleMapMove = useCallback(async () => {
    try {
      if (!map.current) return;

      const center = await map.current.getCenter();
      const zoom = await map.current.getZoom();

      // Only fetch new data if user has moved significantly
      if (lastFetchCenter) {
        const distance = Math.sqrt(
          Math.pow(center[1] - lastFetchCenter.lat, 2) +
            Math.pow(center[0] - lastFetchCenter.lng, 2)
        );

        // If moved more than ~5km at zoom level, fetch new locations
        const threshold = zoom > 12 ? 0.05 : 0.1;
        if (distance < threshold) return;
      }

      // Adjust radius based on zoom level
      const dynamicRadius = 1000;

      await fetchLocations(center[1], center[0], dynamicRadius);
    } catch (error) {
      console.error('Error handling map move:', error);
    }
  }, [lastFetchCenter, fetchLocations]);

  useEffect(() => {
    if (!fadeIn) setTimeout(() => setFadeIn(true), animationDelay);
  }, [fadeIn]);

  useEffect(() => {
    if (selectedLocation) {
      hideHeader();
      hideTabBar();
    }

    return () => {
      showHeader();
      showTabBar();
    };
  }, [selectedLocation]);

  const onSelectLocation = useCallback(
    async (event: OnPressEvent) => {
      if (!!selectedLocation) return;
      const feature = event.features[0];
      const coordinates = (feature.geometry as GeoJSON.Point).coordinates;

      if (feature?.properties?.cluster) {
        camera?.current?.moveTo(coordinates, 500);
        setTimeout(
          async () =>
            camera?.current?.zoomTo((await (map?.current?.getZoom() as Promise<number>)) + 2, 500),
          500
        );
        return;
      }

      const location = (geoJsonData.features || []).find(
        location =>
          location && location.properties && location.properties.id === feature?.properties?.id
      );
      setFadeIn(false);
      setTimeout(() => setSelectedLocation(location), animationDelay);
    },
    [selectedLocation, geoJsonData]
  );

  const onSelectFromDrawer = (location: GeoJSONLocation) => {
    setFadeIn(false);
    setTimeout(() => setSelectedLocation(location), animationDelay);
  };

  const onCloseDrawer = useCallback(() => {
    setFadeIn(false);
    setTimeout(() => setSelectedLocation(null), animationDelay);
  }, []);

  return (
    <Box width="100%" height="100%" position={'relative'}>
      <Portal hostName="headerHost">
        <ReAnimatedBox width="100%" style={fadeInStyle}>
          <LocationsHeader paddingTop="7xl" onExit={onCloseDrawer} onLike={() => {}} />
        </ReAnimatedBox>
      </Portal>
      <MapView
        ref={map}
        style={{ flex: 1 }}
        scaleBarEnabled={false}
        compassEnabled={false}
        logoEnabled={false}
        projection="globe"
        onRegionDidChange={handleMapMove}
      >
        <StyleImport
          id="basemap"
          existing
          config={{
            lightPreset: 'night',
          }}
        />
        <Camera
          ref={camera}
          zoomLevel={DEFAULT_ZOOM_LEVEL}
          centerCoordinate={
            userLocation ? [userLocation.longitude, userLocation.latitude] : [-73.9857, 40.7484]
          }
        />
        <ShapeSource
          cluster
          clusterRadius={100}
          id={'dynamicGeoJsonSource'}
          shape={geoJsonData || { type: 'FeatureCollection', features: [] }}
          onPress={onSelectLocation}
        >
          <CircleLayer
            id="dynamicPointLayer"
            style={{
              circleColor: '#ec4899', // Pink fallback
              circleRadius: 8,
              circleStrokeWidth: 3,
              circleStrokeColor: '#ffffff', // White fallback
            }}
          />
          <SymbolLayer
            id="clusterCountDynamic"
            style={{
              textField: ['get', 'point_count'],
              textSize: 13,
              textColor: 'white',
              textHaloWidth: 0.5,
            }}
          />
        </ShapeSource>
      </MapView>
      <WorldDrawer
        style={fadeInStyle}
        locations={geoJsonData.features || []}
        onSelect={location => onSelectFromDrawer(location)}
        onClose={onCloseDrawer}
        selectedLocation={selectedLocation}
      />
      <Portal hostName="tabBarHost">
        <PriceAndMessageBox
          animatedStyle={fadeInStyle}
          style={{ paddingBottom: bottom, paddingTop: 20 }}
          location={selectedLocation}
        />
      </Portal>
    </Box>
  );
}
