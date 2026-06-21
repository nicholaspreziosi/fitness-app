import * as React from 'react';

type RefreshGuardContextValue = {
  isDragging: boolean;
  isInputFocused: boolean;
  setDragging: (active: boolean) => void;
  setInputFocused: (active: boolean) => void;
};

const RefreshGuardContext = React.createContext<RefreshGuardContextValue | null>(null);

function useCounterFlag(setter: React.Dispatch<React.SetStateAction<boolean>>) {
  const countRef = React.useRef(0);

  return React.useCallback(
    (active: boolean) => {
      const nextCount = Math.max(0, countRef.current + (active ? 1 : -1));
      countRef.current = nextCount;
      setter(nextCount > 0);
    },
    [setter]
  );
}

export function RefreshGuardProvider({ children }: { children: React.ReactNode }) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isInputFocused, setIsInputFocused] = React.useState(false);
  const setDragging = useCounterFlag(setIsDragging);
  const setInputFocused = useCounterFlag(setIsInputFocused);

  const value = React.useMemo(
    () => ({
      isDragging,
      isInputFocused,
      setDragging,
      setInputFocused,
    }),
    [isDragging, isInputFocused, setDragging, setInputFocused]
  );

  return <RefreshGuardContext.Provider value={value}>{children}</RefreshGuardContext.Provider>;
}

export function useRefreshGuard() {
  const context = React.useContext(RefreshGuardContext);

  if (!context) {
    throw new Error('useRefreshGuard must be used within RefreshGuardProvider');
  }

  return context;
}

export function useOptionalRefreshGuard() {
  return React.useContext(RefreshGuardContext);
}

export function useRefreshGuardFlag(
  flag: 'dragging' | 'inputFocused',
  active: boolean
) {
  const guard = useOptionalRefreshGuard();
  const setter = flag === 'dragging' ? guard?.setDragging : guard?.setInputFocused;

  React.useEffect(() => {
    if (!setter) {
      return;
    }

    setter(active);

    return () => {
      setter(false);
    };
  }, [active, setter]);
}

export function useRefreshGuardInputHandlers() {
  const guard = useOptionalRefreshGuard();

  return React.useMemo(
    () => ({
      onFocus: () => {
        guard?.setInputFocused(true);
      },
      onBlur: () => {
        guard?.setInputFocused(false);
      },
    }),
    [guard]
  );
}
