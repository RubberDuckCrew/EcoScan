import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { theme } from "@/theme";

export type SnackbarType = "error" | "success" | "info" | "warning";

type Snackbar = {
  id: string;
  message: string;
  type: SnackbarType;
  duration?: number;
};

type SnackbarContextType = {
  showError: (msg: string, duration?: number) => void;
  showSuccess: (msg: string, duration?: number) => void;
  showInfo: (msg: string, duration?: number) => void;
  showWarning: (msg: string, duration?: number) => void;
  currentSnackbar: Snackbar | undefined;
  dismissSnackbar: () => void;
};

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined,
);

export const getSnackbarStyles = (type: SnackbarType) => {
  switch (type) {
    case "error":
      return {
        backgroundColor: theme.colors.error,
      };
    case "success":
      return {
        backgroundColor: theme.colors.success,
      };
    case "warning":
      return {
        backgroundColor: theme.colors.warning,
      };
    case "info":
      return {
        backgroundColor: theme.colors.info,
      };
    default:
      return {
        backgroundColor: theme.colors.surface,
      };
  }
};

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [snackbarQueue, setSnackbarQueue] = useState<Snackbar[]>([]);
  const [currentSnackbar, setCurrentSnackbar] = useState<
    Snackbar | undefined
  >();

  const addSnackbar = useCallback(
    (message: string, type: SnackbarType, duration?: number) => {
      const id = Date.now().toString();
      setSnackbarQueue((prev) => [
        ...prev,
        { id, message, type, duration: duration ?? 4000 },
      ]);
    },
    [],
  );

  const showError = useCallback(
    (msg: string, duration?: number) => {
      addSnackbar(msg, "error", duration ?? 5000);
    },
    [addSnackbar],
  );

  const showSuccess = useCallback(
    (msg: string, duration?: number) => {
      addSnackbar(msg, "success", duration ?? 3000);
    },
    [addSnackbar],
  );

  const showInfo = useCallback(
    (msg: string, duration?: number) => {
      addSnackbar(msg, "info", duration ?? 3000);
    },
    [addSnackbar],
  );

  const showWarning = useCallback(
    (msg: string, duration?: number) => {
      addSnackbar(msg, "warning", duration ?? 4000);
    },
    [addSnackbar],
  );

  const dismissSnackbar = useCallback(() => {
    setCurrentSnackbar(undefined);
  }, []);

  useEffect(() => {
    if (!currentSnackbar && snackbarQueue.length > 0) {
      const [next, ...rest] = snackbarQueue;
      setCurrentSnackbar(next);
      setSnackbarQueue(rest);
    }
  }, [currentSnackbar, snackbarQueue]);

  useEffect(() => {
    if (!currentSnackbar) return;

    const timer = setTimeout(dismissSnackbar, currentSnackbar.duration);

    return () => clearTimeout(timer);
  }, [currentSnackbar, dismissSnackbar]);

  return (
    <SnackbarContext.Provider
      value={{
        showError,
        showSuccess,
        showInfo,
        showWarning,
        currentSnackbar,
        dismissSnackbar,
      }}
    >
      {children}
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error("useSnackbar must be used within SnackbarProvider");
  return ctx;
}
