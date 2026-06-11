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

type GreenScoreResult = {
  overall_score: number;
  reason: string;
};

export function useGreenScore(): UseGreenScoreResult {
  const api = useApiClient();
  const { startStream, closeStream } =
    useSseClient<GreenScoreResult>("product-evaluation");
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
        try {
          onErrorRef.current("Produktscore konnte nicht geladen werden.");
        } catch (e) {}
      }finally {
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
        console.warn(err);
        try {
          onErrorRef.current("Produkt konnte nicht geladen werden.");
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
        (result) => {
          setProduct((prev) =>
            prev
              ? {
                  ...prev,
                  score: result.overall_score,
                  justification: result.reason,
                }
              : undefined,
          );
          setLoading(false);
          loadingRef.current = false;
        },
        () => {
          setLoading(false);
          loadingRef.current = false;
          try {
            onErrorRef.current("Ein unerwarteter Fehler ist aufgetreten.");
          } catch (e) {}
          console.warn("Error in SSE stream");
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
