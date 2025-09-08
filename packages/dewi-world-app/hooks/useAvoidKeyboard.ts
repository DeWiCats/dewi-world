import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

/**
 * This hook allows to control the 'enabled' prop of a KeyboardAvoidingView component.
 * When keyboard is shown, enable keyboard avoid. When hidden, disable keyboard avoid.
 * @returns Boolean flag to enable/disable keyboard avoid when opening and closing keyboard
 */
export const useAvoidKeyboard = () => {
  const [avoidKeyboard, setAvoidKeyboard] = useState(false);

  // Effect for avoiding keyboard on input focus
  useEffect(() => {
    const keyboardShownEvent = Keyboard.addListener('keyboardDidShow', () =>
      setAvoidKeyboard(true)
    );
    const keyboardHiddenEvent = Keyboard.addListener('keyboardDidHide', () =>
      setAvoidKeyboard(false)
    );

    return () => {
      keyboardShownEvent.remove();
      keyboardHiddenEvent.remove();
    };
  }, []);

  return avoidKeyboard;
};
