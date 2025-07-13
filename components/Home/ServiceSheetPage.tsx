import React, { FC } from "react";
import { SvgProps } from "react-native-svg";
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import Box from "@/components/UI/Box";
import { useColors } from "@/hooks/theme";
import CustomTabBar from "./TabNavigation/CustomTabBar";

const Tab = createBottomTabNavigator();

export type ServiceNavBarOption = {
  name: string;
  component: React.FC;
  Icon: FC<SvgProps>;
  iconProps?: SvgProps;
};

export type ServiceSheetProps = {
  options: ServiceNavBarOption[];
};
const ServiceSheetPage = ({ options }: ServiceSheetProps) => {
  const colors = useColors();

  return (
    <Box height="100%" flexDirection="row" flex={1} zIndex={1}>
      <Tab.Navigator
        tabBar={(props: BottomTabBarProps) => (
          <CustomTabBar {...props} options={options} />
        )}
        screenOptions={{
          sceneStyle: {
            height: "100%",
            backgroundColor: colors.primaryBackground,
          },
          headerShown: false,
          lazy: true,
        }}
      >
        {options.map((option) => (
          <Tab.Screen
            key={option.name}
            name={option.name}
            component={option.component}
          />
        ))}
      </Tab.Navigator>
    </Box>
  );
};

const ServiceSheetPageWrapper = ({ options }: ServiceSheetProps) => {
  return <ServiceSheetPage options={options} />;
};

export default ServiceSheetPageWrapper;
