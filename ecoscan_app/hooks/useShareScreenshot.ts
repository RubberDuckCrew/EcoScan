import { useRef } from "react";
import { Alert, View } from "react-native";
import { captureRef } from "react-native-view-shot";
import { useError } from "@/context/ErrorContext";
import * as Sharing from "expo-sharing";

interface ShareOptions {
  format?: "png" | "jpg" | "webm";
  quality?: number;
}

export function useShareScreenshot(
  options: ShareOptions = { format: "png", quality: 1 },
) {
  const viewRef = useRef<View>(null);
  const { setError } = useError();

  const captureAndShare = async (
    dialogTitle: string = "Bild teilen",
  ): Promise<void> => {
    try {
      const format = options.format ?? "png";
      const quality = options.quality ?? 1;
      const localUri = await captureRef(viewRef, { format, quality });

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        setError("Die Bildfreigabe ist auf dieser Plattform nicht verfügbar.");
        return;
      }

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
      setError("Fehler beim Erfassen und Teilen des Screenshots.");
      console.warn("[useShareScreenshot] ", error);
    }
  };

  return { viewRef, captureAndShare };
}
