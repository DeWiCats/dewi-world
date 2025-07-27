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
import React, { useCallback, useRef, useState } from 'react';
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

  const [selectedLocation, setSelectedLocation] = useState<null | GeoJSONFeature>();
  
  const onSelectLocation = useCallback(
    async (event: OnPressEvent) => {
      if (!!selectedLocation) return
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

      setSelectedLocation(feature as GeoJSONFeature);
    },
    [selectedLocation, locations]
  );

  const onCloseDrawer = useCallback(() => {
    setSelectedLocation(null);
  }, [selectedLocation, locations]);

  return (
    <Box width="100%" height="100%" position={'relative'}>
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
        onClose={onCloseDrawer}
        selectedLocation={selectedLocation}
      />
    </Box>
  );
}
