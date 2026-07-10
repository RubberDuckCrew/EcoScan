import {useCallback,} from "react";
import {useSnackbar} from "@/context/SnackbarContext";

export function useError() {
  const { showError } = useSnackbar();

  const setError = useCallback(
    (msg: string, duration?: number) => {
      showError(msg, duration ?? 5000);
    },
    [showError],
  );

  return { setError };
}
