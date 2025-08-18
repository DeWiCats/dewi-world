import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import ChatDetailScreen from '../chat/Conversation';
import LocationsScreen from './LocationsScreen';

const Stack = createNativeStackNavigator();

export type LocationsStackParamList = {
  Locations: undefined;
  Conversation: { conversationId: string };
};

export type LocationsStackNavigationProp = NativeStackNavigationProp<LocationsStackParamList>;

export default function LocationsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Locations" component={LocationsScreen} />
      <Stack.Screen name="Conversation" component={ChatDetailScreen} />
    </Stack.Navigator>
  );
}
