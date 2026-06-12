import { useRef } from "react";
import { Alert, View } from "react-native";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";

interface ShareOptions {
  format?: "png" | "jpg" | "webm";
  quality?: number;
}

export function useShareScreenshot(
  options: ShareOptions = { format: "png", quality: 1 },
) {
  const viewRef = useRef<View>(null);

  const captureAndShare = async (
    dialogTitle: string = "Bild teilen",
  ): Promise<void> => {
    try {
      const format = options.format ?? "png";
      const quality = options.quality ?? 1;
      const localUri = await captureRef(viewRef, { format, quality });

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        console.error("Sharing is not available on this platform");
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
      console.error("Error capturing and sharing screenshot:", error);
    }
  };

  return { viewRef, captureAndShare };
}
