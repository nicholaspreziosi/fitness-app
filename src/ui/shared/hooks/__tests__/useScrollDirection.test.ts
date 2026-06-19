import { useScrollDirection } from '@/src/ui/shared/hooks/useScrollDirection';
import { act, renderHook } from '@testing-library/react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

function createScrollEvent(offsetY: number): NativeSyntheticEvent<NativeScrollEvent> {
  return {
    nativeEvent: {
      contentOffset: { y: offsetY, x: 0 },
    },
  } as NativeSyntheticEvent<NativeScrollEvent>;
}

describe('useScrollDirection', () => {
  it('hides after scrolling down past the threshold', () => {
    const onVisibilityChange = jest.fn();
    const { result } = renderHook(() => useScrollDirection(onVisibilityChange));

    act(() => {
      result.current.handleScroll(createScrollEvent(20));
      result.current.handleScroll(createScrollEvent(50));
      result.current.handleScroll(createScrollEvent(90));
    });

    expect(onVisibilityChange).toHaveBeenCalledTimes(1);
    expect(onVisibilityChange).toHaveBeenCalledWith(false);
  });

  it('shows after scrolling up past the threshold', () => {
    const onVisibilityChange = jest.fn();
    const { result } = renderHook(() => useScrollDirection(onVisibilityChange));

    act(() => {
      result.current.handleScroll(createScrollEvent(200));
      result.current.handleScroll(createScrollEvent(120));
      result.current.handleScroll(createScrollEvent(40));
    });

    expect(onVisibilityChange).toHaveBeenCalledWith(true);
  });

  it('shows near the top without spamming visibility updates', () => {
    const onVisibilityChange = jest.fn();
    const { result } = renderHook(() => useScrollDirection(onVisibilityChange));

    act(() => {
      result.current.handleScroll(createScrollEvent(200));
      result.current.handleScroll(createScrollEvent(150));
      result.current.handleScroll(createScrollEvent(5));
      result.current.handleScroll(createScrollEvent(4));
      result.current.handleScroll(createScrollEvent(3));
    });

    expect(onVisibilityChange).toHaveBeenCalledTimes(2);
    expect(onVisibilityChange).toHaveBeenLastCalledWith(true);
  });

  it('showHeader only notifies when visibility changes', () => {
    const onVisibilityChange = jest.fn();
    const { result } = renderHook(() => useScrollDirection(onVisibilityChange));

    act(() => {
      result.current.showHeader();
      result.current.handleScroll(createScrollEvent(20));
      result.current.handleScroll(createScrollEvent(50));
      result.current.handleScroll(createScrollEvent(90));
    });

    expect(onVisibilityChange).toHaveBeenCalledTimes(1);
    expect(onVisibilityChange).toHaveBeenCalledWith(false);

    act(() => {
      result.current.showHeader();
    });

    expect(onVisibilityChange).toHaveBeenCalledTimes(2);
    expect(onVisibilityChange).toHaveBeenLastCalledWith(true);
  });

  it('syncScrollPosition avoids a false delta on the next scroll event', () => {
    const onVisibilityChange = jest.fn();
    const { result } = renderHook(() => useScrollDirection(onVisibilityChange));

    act(() => {
      result.current.handleScroll(createScrollEvent(200));
      result.current.syncScrollPosition(200);
      onVisibilityChange.mockClear();
      result.current.handleScroll(createScrollEvent(201));
    });

    expect(onVisibilityChange).not.toHaveBeenCalled();
  });
});
