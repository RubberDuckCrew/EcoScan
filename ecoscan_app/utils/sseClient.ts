import { useAuth } from "@/context/AuthContext";
import { useCallback, useEffect, useRef, useState } from "react";
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

const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 2000;

export function useSseClient<T>(eventName: string): SseClient<T> {
  const { getAccessToken, refresh } = useAuth();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const currentStreamRef = useRef<{
    endpoint: string;
    onMessage: (data: T) => void;
    onError: (error: any) => void;
  } | null>(null);
  const isClosingRef = useRef(false);

  const closeStream = useCallback(() => {
    isClosingRef.current = true;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    reconnectAttemptsRef.current = 0;
  }, []);

  const connectToStream = useCallback(
    (
      endpoint: string,
      onMessage: (data: T) => void,
      onError: (error: any) => void,
    ) => {
      if (isClosingRef.current) {
        return;
      }

      const accessToken = getAccessToken();
      if (!accessToken) {
        console.warn("[SSE] No access token available");
        onError({ message: "No access token available" });
        return;
      }

      try {
        const url = `${ENV.backendUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

        console.log(`[SSE] Connecting to ${url}`);

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
            console.error("[SSE] Error parsing data:", err);
          }
        });

        eventSource.addEventListener("error", (err: any) => {
          console.log("[SSE] Error event received:", err);

          if (isClosingRef.current) {
            try {
              eventSource.close();
            } catch (e) {
              console.warn(
                "[SSE] Error while closing eventSource during isClosing:",
                e,
              );
            }
            return;
          }

          try {
            eventSource.close();
          } catch (e) {
            console.warn(
              "[SSE] Error while closing eventSource on error event:",
              e,
            );
          } finally {
            eventSourceRef.current = null;
          }

          const shouldReconnect =
            reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS &&
            !isClosingRef.current;

          if (shouldReconnect) {
            scheduleReconnect(endpoint, onMessage, onError);
          } else {
            console.error("[SSE] Max reconnection attempts reached");
            onError({
              message: "Verbindung konnte nicht wiederhergestellt werden",
              status: "max_retries_exceeded",
            });
          }
        });

        eventSource.addEventListener("open", () => {
          reconnectAttemptsRef.current = 0;
          console.log("[SSE] Connection established");
        });
      } catch (err) {
        console.error("[SSE] Failed to create EventSource:", err);
        if (!isClosingRef.current) {
          onError(err);
        }
      }
    },
    [getAccessToken, eventName],
  );

  const scheduleReconnect = useCallback(
    (
      endpoint: string,
      onMessage: (data: T) => void,
      onError: (error: any) => void,
    ) => {
      if (isClosingRef.current) {
        return;
      }

      const delay =
        INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current);
      reconnectAttemptsRef.current += 1;

      console.log(
        `[SSE] Scheduling reconnect attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS} in ${delay}ms`,
      );

      reconnectTimeoutRef.current = setTimeout(async () => {
        if (isClosingRef.current) {
          return;
        }

        try {
          console.log("[SSE] Refreshing token before reconnect...");
          await refresh();
        } catch (err) {
          console.warn("[SSE] Token refresh failed during reconnect:", err);
        }

        connectToStream(endpoint, onMessage, onError);
      }, delay);
    },
    [refresh],
  );

  const startStream = useCallback(
    (
      endpoint: string,
      onMessage: (data: T) => void,
      onError: (error: any) => void,
    ) => {
      closeStream();
      isClosingRef.current = false;
      currentStreamRef.current = { endpoint, onMessage, onError };
      connectToStream(endpoint, onMessage, onError);
    },
    [connectToStream, closeStream],
  );

  useEffect(() => {
    return () => {
      closeStream();
    };
  }, [closeStream]);

  return { startStream, closeStream };
}
