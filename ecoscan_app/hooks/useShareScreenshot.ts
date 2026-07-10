import {useRef, useState} from "react";
import {View} from "react-native";
import {captureRef} from "react-native-view-shot";
import {useSnackbar} from "@/context/SnackbarContext";
import * as Sharing from "expo-sharing";
import {File} from "expo-file-system";

interface ShareOptions {
  format?: "png" | "jpg" | "webm";
  quality?: number;
}

export function useShareScreenshot({
  format = "png",
  quality = 1,
}: ShareOptions = {}) {
  const viewRef = useRef<View>(null);
  const { showError } = useSnackbar();
  const [isSharing, setIsSharing] = useState(false);

  const captureAndShare = async (
    dialogTitle: string = "Bild teilen",
  ): Promise<void> => {
    if (isSharing) return;
    setIsSharing(true);
    let localUri: string | null = null;

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        showError("Die Bildfreigabe ist auf dieser Plattform nicht verfügbar.");
        return;
      }
      localUri = await captureRef(viewRef, { format, quality });
      const mimeTypeByFormat: Record<"png" | "jpg" | "webm", string> = {
        png: "image/png",
        jpg: "image/jpeg",
        webm: "video/webm",
      };

      await Sharing.shareAsync(localUri, {
        mimeType: mimeTypeByFormat[format],
        dialogTitle: dialogTitle,
      });
    } catch (error: any) {
      showError("Fehler beim Erfassen und Teilen des Screenshots.");
      console.warn("[useShareScreenshot] ", error);
    } finally {
      if (localUri) {
        try {
          const tempFile = new File(localUri);
          if (tempFile.exists) {
            tempFile.delete();
          }
        } catch (cleanupError) {
          console.warn(
            "[useShareScreenshot] Error cleaning up temporary file: ",
            cleanupError,
          );
        }
      }
      setIsSharing(false);
    }
  };

  return { viewRef, captureAndShare, isSharing };
}
