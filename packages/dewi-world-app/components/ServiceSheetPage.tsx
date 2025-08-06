import { Color } from '@/constants/theme';
import { useColors } from '@/hooks/theme';
import { useTabsStore } from '@/stores/useTabsStore';
import useHaptic from '@hooks/useHaptic';
import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import React, { FC, useCallback, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgProps } from 'react-native-svg';
import ServiceNavBar from './ServiceNavBar';
import Box from './ui/Box';

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

function CustomTabBar({
  state,
  navigation,
  options,
}: BottomTabBarProps & {
  options: ServiceNavBarOption[];
  showTabBar?: boolean;
}) {
  const { triggerImpact } = useHaptic();
  const { bottom } = useSafeAreaInsets();
  const { tabBarVisible } = useTabsStore();

  const tabData = useMemo((): {
    value: string;
    Icon: FC<SvgProps>;
    iconColor: Color;
  }[] => {
    return options.map(option => {
      return {
        value: option.name,
        Icon: option.Icon,
        iconColor: 'primaryText',
        iconProps: option.iconProps,
      };
    });
  }, [options]);

  const selectedValue = tabData[state.index].value;

  const onPress = useCallback(
    (type: string) => {
      triggerImpact('light');
      const index = tabData.findIndex(item => item.value === type);
      const isSelected = selectedValue === type;
      const event = navigation.emit({
        type: 'tabPress',
        target: state.routes[index || 0].key,
        canPreventDefault: true,
      });

      if (!isSelected && !event.defaultPrevented) {
        // The `merge: true` option makes sure that the params inside the tab screen are preserved
        navigation.navigate({
          name: state.routes[index || 0].name,
          merge: true,
          params: undefined,
        });
      }
    },
    [navigation, selectedValue, state, tabData, triggerImpact]
  );

  const onLongPress = useCallback(
    (type: string) => {
      const index = tabData.findIndex(item => item.value === type);

      navigation.emit({
        type: 'tabLongPress',
        target: state.routes[index || 0].key,
      });
    },
    [navigation, state.routes, tabData]
  );

  if (options?.length <= 1) {
    return (
      <>
        <StatusBar style="light" />
      </>
    );
  }

  return (
    <>
      <StatusBar style={selectedValue === 'WorldTab' ? 'dark' : 'light'} />
      <Box
        backgroundColor="primaryBackground"
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        paddingTop="2"
      >
        <Box
          style={{
            marginBottom: tabBarVisible ? bottom : 20,
          }}
        >
          <ServiceNavBar
            navBarOptions={tabData}
            selectedValue={selectedValue}
            onItemSelected={onPress}
            onItemLongPress={onLongPress}
          />
        </Box>
      </Box>
    </>
  );
}

const ServiceSheetPage = ({ options }: ServiceSheetProps) => {
  const colors = useColors();

  const tabBarComponent = (props: BottomTabBarProps) => (
    <CustomTabBar {...props} options={options} />
  );

  return (
    <Box height="100%" flexDirection="row" flex={1} zIndex={1}>
      <Tab.Navigator
        tabBar={tabBarComponent}
        screenOptions={{
          sceneStyle: {
            height: '100%',
            backgroundColor: colors.primaryBackground,
          },
          headerShown: false,
          lazy: true,
        }}
      >
        {options.map(option => (
          <Tab.Screen key={option.name} name={option.name} component={option.component} />
        ))}
      </Tab.Navigator>
    </Box>
  );
};

const ServiceSheetPageWrapper = ({ options }: ServiceSheetProps) => {
  return <ServiceSheetPage options={options} />;
};

export default ServiceSheetPageWrapper;
