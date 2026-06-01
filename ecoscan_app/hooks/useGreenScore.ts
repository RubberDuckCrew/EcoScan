import { useApiClient } from "@/utils/apiClient";
import { useCallback, useEffect, useRef, useState } from "react";
import { Product } from "@/types/product";
import { useSseClient } from "@/utils/sseClient";

type UseGreenScoreResult = {
  loading: boolean;
  product?: Product;
  jobId?: string;
  fetchGreenScore: (productId: string) => Promise<void>;
  fetchProduct: (productId: string) => Promise<void>;
  onError: (handler: (err?: any) => void) => void;
};

export function useGreenScore(): UseGreenScoreResult {
  const api = useApiClient();
  const { startStream, closeStream } = useSseClient<number>("product-score");
  const [loading, setLoading] = useState<boolean>(false);
  const [product, setProduct] = useState<Product>();
  const [jobId, setJobId] = useState<string>();
  const loadingRef = useRef(false);
  const onErrorRef = useRef<(err?: any) => void>(() => {});

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    if (!jobId) return;

    startSseListener(jobId);

    return () => {
      closeStream();
    };
  }, [jobId]);

  const fetchGreenScore = useCallback(
    async (productId: string) => {
      if (loadingRef.current) return;

      setLoading(true);
      loadingRef.current = true;

      try {
        const data = await api.post(`score/${productId}`);
        if (data) {
          setJobId(data);
        }
      } catch (err) {
        console.error("useGreenScore fetch error", err);
        try {
          onErrorRef.current(err);
        } catch (e) {}
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [api],
  );

  const fetchProduct = useCallback(
    async (productId: string) => {
      if (loadingRef.current) return;

      setLoading(true);
      loadingRef.current = true;

      try {
        const data = await api.get(`product/${productId}`);
        if (data) {
          setProduct(data);
          return data;
        }
      } catch (err) {
        console.error("fetchProduct fetch error", err);
        try {
          onErrorRef.current(err);
        } catch (e) {}
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [api],
  );

  const startSseListener = useCallback(
    (jobId: string) => {
      startStream(
        `jobs/stream/${jobId}`,
        (score) => {
          setProduct((prev) => (prev ? { ...prev, score } : undefined));
          setLoading(false);
          loadingRef.current = false;
        },
        () => {
          setLoading(false);
          loadingRef.current = false;
          const err = new Error("Error in SSE stream");
          try {
            onErrorRef.current(err);
          } catch (e) {}
          console.error("Error in SSE stream");
        },
      );
    },
    [startStream],
  );

  const onError = useCallback((handler: (err?: any) => void) => {
    onErrorRef.current = handler || (() => {});
  }, []);

  return { fetchGreenScore, fetchProduct, product, loading, jobId, onError };
}
