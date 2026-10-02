jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: {
      View,
      createAnimatedComponent: (component: unknown) => component,
    },
    FadeIn: {},
    FadeOut: {},
    useSharedValue: (initial: number) => ({ value: initial }),
    useAnimatedStyle: () => ({}),
    withTiming: (value: number) => value,
  };
});

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { render, screen } from '@testing-library/react-native';

describe('Select', () => {
  it('matches the trigger to the text input surface', () => {
    render(
      <Select>
        <SelectTrigger testID="select-trigger">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem label="Active" value="active" />
        </SelectContent>
      </Select>
    );

    const trigger = screen.getByTestId('select-trigger');
    expect(trigger.props.className).toContain('h-12');
    expect(trigger.props.className).toContain('bg-background');
    expect(trigger.props.className).toContain('border-border');
    expect(trigger.props.className).not.toContain('dark:bg-input/30');
  });
});
