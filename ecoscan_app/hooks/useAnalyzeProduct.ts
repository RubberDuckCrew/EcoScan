import { useApiClient } from "@/utils/apiClient";
import { useProduct } from "@/context/ProductContext";
import { useError } from "@/context/ErrorContext";
import { useCallback, useEffect, useState } from "react";
import { useSseClient } from "@/utils/sseClient";
import { Product } from "@/types/product";

type UseAnalyzeProductResult = {
  loading: boolean;
  analyzeProduct: (productId: string) => Promise<void>;
};

type AnalyzeProductResult = {
  product: Product;
};

export function useAnalyzeProduct(): UseAnalyzeProductResult {
  const api = useApiClient();
  const { setProduct } = useProduct();
  const { setError } = useError();
  const [loading, setLoading] = useState<boolean>(false);
  const { startStream, closeStream } = useSseClient<AnalyzeProductResult>(
    "product-analysis-evaluation",
  );
  const [jobId, setJobId] = useState<string | undefined>();

  const handleStreamError = useCallback(() => {
    setLoading(false);
    setError(
      "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
    );
    console.error("Error in SSE stream");
  }, [setError]);

  const handleStreamSuccess = useCallback(
    (result: AnalyzeProductResult) => {
      setProduct(() => result.product);
      setLoading(false);
    },
    [setProduct],
  );

  const analyzeProduct = useCallback(
    async (productId: string) => {
      setLoading(true);
      try {
        const data = await api.post(`product/analyze/${productId}`);
        setJobId(data);
      } catch (err) {
        setLoading(false);
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Produkt konnte nicht analysiert werden.";
        setError(errorMsg);
      }
    },
    [api, setError],
  );

  const startSseListener = useCallback(
    (jobId: string) => {
      startStream(jobId, handleStreamSuccess, handleStreamError);
    },
    [startStream, handleStreamSuccess, handleStreamError],
  );

  useEffect(() => {
    if (!jobId) return;
    startSseListener(jobId);
    return () => {
      closeStream();
    };
  }, [jobId, startSseListener]);

  return { loading, analyzeProduct };
}
