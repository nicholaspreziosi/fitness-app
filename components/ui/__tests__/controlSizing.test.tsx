import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { render, screen } from '@testing-library/react-native';

function ancestorClassName(node: { parent?: unknown } | null, token: string) {
  let current = node?.parent as { props?: { className?: string }; parent?: unknown } | undefined;

  while (current) {
    if (current.props?.className?.includes(token)) {
      return current.props.className;
    }
    current = current.parent as typeof current;
  }

  return undefined;
}

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

    expect(ancestorClassName(screen.getByLabelText('Name'), 'h-12')).toContain('h-12');
  });

  it('centers input text in the chrome instead of a fixed-height TextInput', () => {
    render(<Input accessibilityLabel="Name" />);

    const input = screen.getByLabelText('Name');
    const styles = [input.props.style].flat();

    expect(ancestorClassName(input, 'justify-center')).toContain('justify-center');
    expect(styles).toEqual(
      expect.arrayContaining([expect.objectContaining({ fontSize: 14, paddingVertical: 0 })])
    );
    expect(styles.some((entry) => entry && typeof entry === 'object' && 'lineHeight' in entry)).toBe(
      false
    );
  });
});
