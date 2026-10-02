import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { render, screen } from '@testing-library/react-native';

describe('shared control sizing', () => {
  it('keeps button heights at native touch size', () => {
    expect(buttonVariants({ size: 'sm' })).toContain('h-11');
    expect(buttonVariants({ size: 'default' })).toContain('h-12');
    expect(buttonVariants({ size: 'lg' })).toContain('h-12');
    expect(buttonVariants({ size: 'icon' })).toContain('size-12');
  });

  it('dims a disabled button', () => {
    render(<Button disabled>Save</Button>);

    expect(screen.getByRole('button').props.className).toContain('opacity-40');
  });

  it('uses a 48px input height', () => {
    render(<Input accessibilityLabel="Name" />);

    expect(screen.getByLabelText('Name').props.className).toContain('h-12');
  });
});
