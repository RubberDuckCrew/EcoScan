import { useApiClient } from "@/utils/apiClient";
import { useProduct } from "@/context/ProductContext";
import { useError } from "@/context/ErrorContext";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSseClient } from "@/utils/sseClient";
import { Product } from "@/types/product";

type UseAnalyzeProductResult = {
  loading: boolean;
  analyzeProduct: (productId: string) => Promise<boolean>;
};

export function useAnalyzeProduct(): UseAnalyzeProductResult {
  const api = useApiClient();
  const { setProduct } = useProduct();
  const { setError } = useError();
  const [loading, setLoading] = useState<boolean>(false);
  const { startStream, closeStream } = useSseClient<Product>(
    "product-analysis-evaluation",
  );
  const [jobId, setJobId] = useState<string | undefined>();

  const completionRef = useRef<{
    resolve: (ok: boolean) => void;
    reject: (err?: any) => void;
  } | null>(null);

  const handleStreamError = useCallback(
    (err?: any) => {
      closeStream();
      setJobId(undefined);
      setLoading(false);
      setError(
        "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
      );
      console.error("Error in SSE stream", err);
      if (completionRef.current) {
        completionRef.current.reject(err);
        completionRef.current = null;
      }
    },
    [setError],
  );

  const handleStreamSuccess = useCallback(
    (result: Product) => {
      setProduct(() => result);
      setLoading(false);
      closeStream();
      setJobId(undefined);
      if (completionRef.current) {
        completionRef.current.resolve(true);
        completionRef.current = null;
      }
    },
    [setProduct],
  );

  const analyzeProduct = useCallback(
    async (productId: string): Promise<boolean> => {
      if (completionRef.current) {
        throw new Error("A product analysis is already in progress.");
      }
      setLoading(true);
      try {
        const data = await api.post(`product/analyze/${productId}`);
        if (data) {
          return new Promise<boolean>((resolve, reject) => {
            completionRef.current = { resolve, reject };
            setJobId(String(data));
          });
        }
        try {
          const productData = await api.get(`product/${productId}`);
          setLoading(false);
          if (productData) {
            setProduct(productData);
            return true;
          }
          return false;
        } catch (err) {
          setLoading(false);
          setError("Produkt konnte nicht geladen werden.");
          throw err;
        }
      } catch (err) {
        setLoading(false);
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Produkt konnte nicht analysiert werden.";
        setError(errorMsg);
        throw err;
      }
    },
    [api, setError, setProduct],
  );

  const startSseListener = useCallback(
    (jobId: string) => {
      startStream(
        `jobs/stream/${jobId}`,
        handleStreamSuccess,
        handleStreamError,
      );
    },
    [startStream, handleStreamSuccess, handleStreamError],
  );

  useEffect(() => {
    if (!jobId) return;
    startSseListener(jobId);
    return () => {
      closeStream();
    };
  }, [jobId, startSseListener, closeStream]);

  useEffect(() => {
    return () => {
      if (completionRef.current) {
        completionRef.current.reject("Component unmounted");
        completionRef.current = null;
      }
      closeStream();
    };
  }, [closeStream]);

  return { loading, analyzeProduct };
}
