import LocationsHeader from '@/components/LocationsHeader';
import Box from '@/components/ui/Box';
import geojson, { GeoJSONFeature } from '@/geojson';
import { useColors } from '@/hooks/theme';
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
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { TabsContext } from '../context';
import WorldDrawer from './WorldDrawer';

setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN as string);

const DEFAULT_ZOOM_LEVEL = 17;

export default function WorldScreen() {
  const colors = useColors();

  // Control globe camera
  const camera = useRef<Camera>(null);

  // Control globe mapview
  const map = useRef<MapView>(null);

  const locations = geojson;
  const context = useContext(TabsContext);

  const [selectedLocation, setSelectedLocation] = useState<null | GeoJSONFeature>();
  const [fadeIn, setFadeIn] = useState(true);

  const animationDelay = 400;

  useEffect(() => {
    if (!fadeIn) setTimeout(() => setFadeIn(true), animationDelay);
  }, [fadeIn]);

  useEffect(() => {
    if (selectedLocation) {
      context.hideHeader();
      context.hideTabBar();
    }

    return () => {
      context.showHeader();
      context.showTabBar();
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

      const location = locations.features.find(
        location => location.properties.name === feature?.properties?.name
      );
      setFadeIn(false);
      setTimeout(() => setSelectedLocation(location as GeoJSONFeature), animationDelay);
    },
    [selectedLocation, locations]
  );

  const onSelectFromDrawer = (location: GeoJSONFeature) => {
    setFadeIn(false);
    setSelectedLocation(location);
  };

  const onCloseDrawer = useCallback(() => {
    setFadeIn(false);
    setTimeout(() => setSelectedLocation(null), animationDelay);
  }, [selectedLocation, locations]);

  return (
    <Box width="100%" height="100%" position={'relative'}>
      {selectedLocation && <LocationsHeader onExit={onCloseDrawer} onLike={() => {}} />}
      <MapView
        ref={map}
        styleURL="mapbox://styles/mapbox/standard-beta"
        style={{ flex: 1 }}
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
        <Camera
          ref={camera}
          zoomLevel={DEFAULT_ZOOM_LEVEL}
          // centerCoordinate={[80.19261, 25.75914]}
        />
        <ShapeSource
          cluster
          clusterRadius={100}
          id={'myGeoJsonSource'}
          shape={locations}
          onPress={onSelectLocation}
        >
          <CircleLayer
            id="myPointLayer"
            style={{
              circleColor: colors['pink.500'],
              circleRadius: 8,
              circleStrokeWidth: 3,
              circleStrokeColor: colors['base.white'],
            }}
          ></CircleLayer>
          <SymbolLayer
            id="clusterCount"
            style={{
              textField: ['get', 'point_count'], // Display the count
              textSize: 13,
              textColor: 'white',
              textHaloWidth: 0.5,
            }}
          />
        </ShapeSource>
      </MapView>
      <WorldDrawer
        fadeIn={fadeIn}
        animationDelay={animationDelay}
        locations={locations.features}
        onSelect={onSelectFromDrawer}
        onClose={onCloseDrawer}
        selectedLocation={selectedLocation}
      />
    </Box>
  );
}
