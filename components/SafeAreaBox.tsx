import { Theme } from "@/constants/theme";
import { createBox } from "@shopify/restyle";
import { SafeAreaView } from "react-native-safe-area-context";

const SafeAreaBox = createBox<Theme, React.ComponentProps<typeof SafeAreaView>>(
  SafeAreaView
);

export default SafeAreaBox;
