import { useApiClient } from "@/utils/apiClient";
import { useSseClient } from "@/utils/sseClient";
import { useCallback, useEffect, useRef, useState } from "react";
import { Product } from "@/types/product";

type UseAlternativesResult = {
  alternatives: Alternative[];
  loading: boolean;
  fetchAlternatives: (
    productId: string,
    categories: string,
    userCoordinates: string,
  ) => Promise<void>;
  onError: (handler: (err?: any) => void) => void;
};

type Alternative = Product & {
  latitude: number;
  longitude: number;
};

export function useAlternatives(): UseAlternativesResult {
  const api = useApiClient();
  const { startStream, closeStream } = useSseClient<Alternative>(
    "product-alternatives",
  );
  const { startStream: startCompletedStream, closeStream: closeCompletedStream } = useSseClient<boolean>(
      "product-alternatives-completed",
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);

  const loadingRef = useRef(false);
  const onErrorRef = useRef<(err?: any) => void>(() => {});

  const cleanupStreams = useCallback(() => {
    closeStream();
    closeCompletedStream();
    setLoading(false);
    loadingRef.current = false;
  }, [closeStream, closeCompletedStream]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  const startSseListenerAgents = useCallback(
    (jobId: string) => {
      //TODO wann stream schließen?
      startStream(
        `jobs/stream/${jobId}`,
        (result: Product) => {
          console.info("Alternative received: ", result);
          setAlternatives((prev => [...prev, result]));
        },
        () => {
          //TODO als int
          setLoading(false);
          loadingRef.current = false;
          try {
            onErrorRef.current(new Error("Error in SSE stream"));
          } catch (e) {}
          console.error("Error in SSE stream");
        },
      );
    },
    [startStream, ],
  );

  const fetchAlternatives = useCallback(
    async (productId: string, categories: string, userCoordinates: string) => {
      if (loadingRef.current) return;

      setLoading(true);
      loadingRef.current = true;
      setAlternatives([]);

      try {
        const jobId = await api.post(
            `alternatives/${productId}?categories=${encodeURIComponent(categories)}&userCoordinates=${encodeURIComponent(userCoordinates)}`);
        console.log("jobId raw:", jobId, "type:", typeof jobId, "length:", jobId?.length);
        console.log("SSE URL:", `jobs/stream/${jobId}`)
        if (jobId) {
          startSseListenerAgents(jobId);
        }
      } catch (e) {
        console.error("Error in fetchAlternatives", e);
        try {
          onErrorRef.current(e);
        } catch {}

        setLoading(false);
        loadingRef.current = false;
      }
    },
    [api],
  );

  return {
    alternatives,
    loading,
    fetchAlternatives,
    onError: useCallback((handler: (err?: any) => void) => {
      onErrorRef.current = handler || (() => {});
    }, []),
  };
}
