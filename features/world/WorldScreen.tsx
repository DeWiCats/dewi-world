import Box from "@/components/ui/Box";
import geojson from "@/geojson";
import { useColors } from "@/hooks/theme";
import Mapbox, { Camera } from "@rnmapbox/maps";
import React, { useRef } from "react";

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN as string);

const DEFAULT_ZOOM_LEVEL = 1;

export default function WorldScreen() {
  const colors = useColors();
  // Control globe camera
  const camera = useRef<Camera>(null);

  return (
    <Box width="100%" height="100%">
      <Mapbox.MapView
        style={{ flex: 1 }}
        scaleBarEnabled={false}
        compassEnabled={false}
        logoEnabled={false}
        projection="globe"
      >
        <Mapbox.Camera ref={camera} zoomLevel={DEFAULT_ZOOM_LEVEL} />
        <Mapbox.ShapeSource
          cluster
          clusterRadius={100}
          id={"myGeoJsonSource"}
          shape={geojson}
          onPress={(event) => console.log(event.point)}
        >
          <Mapbox.CircleLayer
            id="myPointLayer"
            style={{
              circleColor: colors["pink.500"],
              circleRadius: 8,
              circleStrokeWidth: 3,
              circleStrokeColor: colors["base.white"],
            }}
          ></Mapbox.CircleLayer>
          <Mapbox.SymbolLayer
            id="clusterCount"
            style={{
              textField: ["get", "point_count"], // Display the count
              textSize: 13,
              textColor: "white",
              textHaloWidth: 0.5,
            }}
          />
        </Mapbox.ShapeSource>
      </Mapbox.MapView>
    </Box>
  );
}
