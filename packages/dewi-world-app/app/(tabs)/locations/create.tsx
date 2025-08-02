import { useStepperStore } from '@/stores/useStepperStore';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { LocationsStackNavigationProp } from './LocationsNavigator';

export default function CreateLocationScreen() {
  const navigation = useNavigation<LocationsStackNavigationProp>();
  const { showStepper, hideStepper } = useStepperStore();

  useEffect(() => {
    // Show stepper when component mounts
    showStepper();

    // Hide stepper when component unmounts
    return () => {
      hideStepper();
    };
  }, [showStepper, hideStepper]);

  const handleComplete = () => {
    // Hide stepper and reset navigation stack to Locations screen
    hideStepper();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Locations' }],
    });
  };

  // This component is now just a controller - the actual stepper renders globally
  return null;
}
