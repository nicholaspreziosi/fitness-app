import { useColorScheme } from 'nativewind';
import { useLayoutEffect } from 'react';
import { Appearance, Platform } from 'react-native';

type AppColorScheme = 'light' | 'dark';

function readSystemColorScheme(): AppColorScheme {
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
}

export function useSystemColorScheme(): AppColorScheme {
  const { colorScheme, setColorScheme } = useColorScheme();

  useLayoutEffect(() => {
    if (Platform.OS !== 'web') {
      setColorScheme('system');
      return;
    }

    const applySystemScheme = () => {
      setColorScheme(readSystemColorScheme());
    };

    applySystemScheme();
    const subscription = Appearance.addChangeListener(applySystemScheme);

    return () => {
      subscription.remove();
    };
  }, [setColorScheme]);

  return colorScheme === 'dark' ? 'dark' : 'light';
}
