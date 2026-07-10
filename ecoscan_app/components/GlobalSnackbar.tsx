import { getSnackbarStyles, useSnackbar } from "@/context/SnackbarContext";
import { Snackbar } from "react-native-paper";

export default function GlobalSnackbar() {
  const { currentSnackbar, dismissSnackbar } = useSnackbar();
  return (
    <Snackbar
      key={currentSnackbar?.id || "snackbar-empty"}
      visible={!!currentSnackbar}
      onDismiss={dismissSnackbar}
      duration={currentSnackbar?.duration || 4000}
      style={{
        ...(currentSnackbar ? getSnackbarStyles(currentSnackbar.type) : {}),
        marginBottom: 70,
      }}
    >
      {currentSnackbar?.message || ""}
    </Snackbar>
  );
}
