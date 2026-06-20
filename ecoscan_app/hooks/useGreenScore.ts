import { useApiClient } from "@/utils/apiClient";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSseClient } from "@/utils/sseClient";
import { useProduct } from "@/context/ProductContext";
import { Product } from "@/types/product";

type UseGreenScoreResult = {
  loading: boolean;
  fetchGreenScore: (productId: string) => Promise<void>;
  fetchProduct: (productId: string) => Promise<Product>;
  onError: (handler: (err?: any) => void) => void;
};

type GreenScoreResult = {
  overall_score: number;
  environmentScore: number;
  socialScore: number;
  healthScore: number;
  reason: string;
};

export function useGreenScore(): UseGreenScoreResult {
  const api = useApiClient();
  const { startStream, closeStream } =
    useSseClient<GreenScoreResult>("product-evaluation");
  const [loading, setLoading] = useState<boolean>(false);
  const { setProduct } = useProduct();
  const [jobId, setJobId] = useState<string>();
  const loadingRef = useRef(false);
  const onErrorRef = useRef<(err?: any) => void>(() => {});

  const setLoading_ = useCallback((val: boolean) => {
    setLoading(val);
    loadingRef.current = val;
  }, []);

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
      setLoading_(true);
      try {
        const data = await api.post(`score/${productId}`);
        if (data) {
          setJobId(data);
        }
      } catch (err) {
        try {
          onErrorRef.current("Produktscore konnte nicht geladen werden.");
          setLoading_(false);
        } catch (e) {}
      }
    },
    [api],
  );

  const fetchProduct = useCallback(
    async (productId: string) => {
      if (loadingRef.current) return;

      setLoading_(true);

      try {
        const data = await api.get(`product/${productId}`);
        if (data) {
          setProduct(data);
          setLoading_(false);
          return data;
        }
      } catch (err) {
        console.warn(err);
        try {
          onErrorRef.current("Produkt konnte nicht geladen werden.");
          setLoading_(false);
        } catch (e) {}
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
          setLoading_(false);
        },
        () => {
          setLoading_(false);
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

  return { fetchGreenScore, fetchProduct, loading, onError };
}
