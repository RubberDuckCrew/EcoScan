import { useAuth } from "@/context/AuthContext";
import { useCallback, useEffect, useRef } from "react";
import { ENV } from "@/utils/env";
import EventSource from "react-native-sse";

export type SseClient<T> = {
  startStream: (
    endpoint: string,
    onMessage: (data: T) => void,
    onError: (error: any) => void,
  ) => void;
  closeStream: () => void;
};

export function useSseClient<T>(eventName: string): SseClient<T> {
  const { accessToken } = useAuth();

  const eventSourceRef = useRef<EventSource | null>(null);

  const closeStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  const startStream = useCallback(
    (
      endpoint: string,
      onMessage: (data: T) => void,
      onError: (error: any) => void,
    ) => {
      closeStream();

      const url = `${ENV.backendUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

      const eventSource = new EventSource<string>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      eventSourceRef.current = eventSource;

      eventSource.addEventListener(eventName, (event: any) => {
        try {
          const parsedData = JSON.parse(event.data) as T;
          onMessage(parsedData);
        } catch (err) {
          console.error("Error loading sse data", err);
        }
      });

      eventSource.addEventListener("error", (err: any) => {
        console.log("Error in SSE connection", err);
        onError(err);
        closeStream();
      });
    },
    [accessToken, eventName, closeStream],
  );

  useEffect(() => {
    return () => {
      closeStream();
    };
  }, [closeStream]);

  return { startStream, closeStream };
}
