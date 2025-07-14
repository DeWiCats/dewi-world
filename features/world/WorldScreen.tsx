import Box from "@/components/ui/Box";
import Mapbox, { Camera } from "@rnmapbox/maps";
import React, { useRef } from "react";

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN as string);

const DEFAULT_ZOOM_LEVEL = 1;

export default function WorldScreen() {
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
      </Mapbox.MapView>
    </Box>
  );
}
