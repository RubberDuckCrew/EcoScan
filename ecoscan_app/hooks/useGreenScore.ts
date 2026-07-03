import { useApiClient } from "@/utils/apiClient";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSseClient } from "@/utils/sseClient";
import { useProduct } from "@/context/ProductContext";

type GreenScoreResult = {
  overallScore: number;
  environmentScore: number;
  socialScore: number;
  healthScore: number;
  reason: string;
};

type UseGreenScoreReturn = {
  loading: boolean;
  error: string | undefined;
  fetchGreenScore: (productId: string) => Promise<void>;
  clearError: () => void;
  cancelGreenScore: () => void;
};

export function useGreenScore(): UseGreenScoreReturn {
  const api = useApiClient();
  const { startStream, closeStream } =
    useSseClient<GreenScoreResult>("product-evaluation");
  const { setProduct } = useProduct();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const loadingRef = useRef(false);
  const fetchIdRef = useRef(0);

  const updateLoading = useCallback((value: boolean) => {
    loadingRef.current = value;
    setLoading(value);
  }, []);

  useEffect(() => {
    return () => {
      closeStream();
    };
  }, [closeStream]);

  const startSseListener = useCallback(
    (jobId: string) => {
      startStream(
        `jobs/stream/${jobId}`,
        (result) => {
          setProduct((prev) =>
            prev
              ? {
                  ...prev,
                  score: result.overallScore,
                  justification: result.reason,
                  environmentScore: result.environmentScore,
                  socialScore: result.socialScore,
                  healthScore: result.healthScore,
                }
              : undefined,
          );
          updateLoading(false);
          closeStream();
        },
        () => {
          updateLoading(false);
          setError("Ein unerwarteter Fehler ist aufgetreten.");
          console.warn("Error in SSE stream");
          closeStream();
        },
      );
    },
    [startStream, closeStream, setProduct, updateLoading],
  );

  const fetchGreenScore = useCallback(
    async (productId: string) => {
      if (loadingRef.current) return;
      updateLoading(true);
      setError(undefined);
      const currentFetchId = ++fetchIdRef.current;
      try {
        const jobId = await api.post(`score/${productId}`);
        if (currentFetchId !== fetchIdRef.current) {
          return;
        }
        if (!jobId || typeof jobId !== "string") {
          setError("Produktscore konnte nicht geladen werden.");
          updateLoading(false);
          return;
        }

        startSseListener(jobId);
      } catch (err) {
        if (currentFetchId !== fetchIdRef.current) {
          return;
        }
        console.warn("Failed to fetch green score:", err);
        setError("Produktscore konnte nicht geladen werden.");
        updateLoading(false);
      }
    },
    [api, updateLoading, startSseListener],
  );

  const clearError = useCallback(() => {
    setError(undefined);
  }, []);

  const cancelGreenScore = useCallback(() => {
    fetchIdRef.current += 1;
    closeStream();
    updateLoading(false);
  }, [closeStream, updateLoading]);

  return { loading, error, fetchGreenScore, clearError, cancelGreenScore };
}
