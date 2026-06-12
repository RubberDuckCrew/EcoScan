import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useRef,
} from "react";

type ErrorContextType = {
  setError: (msg: string) => void;
  consumeError: () => string | undefined;
};

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: ReactNode }) {
  const errorRef = useRef<string | undefined>(undefined);

  const setError = useCallback((msg: string) => {
    errorRef.current = msg;
  }, []);

  const consumeError = useCallback(() => {
    const msg = errorRef.current;
    errorRef.current = undefined;
    return msg;
  }, []);

  return (
    <ErrorContext.Provider value={{ setError, consumeError }}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const ctx = useContext(ErrorContext);
  if (!ctx) throw new Error("useError must be used within ErrorProvider");
  return ctx;
}
