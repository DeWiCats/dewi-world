import { useMemo } from "react";
import ServiceSheetPageWrapper, { ServiceNavBarOption } from "./ServiceSheetPage";
import Box from "../UI/Box";
import Map from "@/assets/svgs/map.svg"
import Coin from "@/assets/svgs/coin.svg"
import Hotspot from "@/assets/svgs/hotspot.svg"
import Add from "@/assets/svgs/add.svg"

const MockComponent = () => <Box></Box>;

const HotspotService = () => {
  
  const options = useMemo((): Array<ServiceNavBarOption> => {
    return [
      { name: "Hotspot", Icon: Hotspot, component: MockComponent },
      { name: "Explorer", Icon: Map, component: MockComponent },
      { name: "AddHotspot", Icon: Add, component: MockComponent },
      { name: "ClaimTokens", Icon: Coin, component: MockComponent },
    ];
  }, []);

  return (
    <Box flex={1}>
      <Box flex={1}>
        <ServiceSheetPageWrapper options={options} />
      </Box>
    </Box>
  );
};

export default HotspotService;
