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
      if (completionRef.current) {
        completionRef.current.resolve(true);
        completionRef.current = null;
      }
    },
    [setProduct],
  );

  const analyzeProduct = useCallback(
    async (productId: string): Promise<boolean> => {
      setLoading(true);
      return new Promise<boolean>(async (resolve, reject) => {
        completionRef.current = { resolve, reject };
        try {
          const data = await api.post(`product/analyze/${productId}`);
          if (data) {
            setJobId(String(data));
            return;
          }
          try {
            const productData = await api.get(`product/${productId}`);
            if (productData) {
              setProduct(productData);
              setLoading(false);
              completionRef.current = null;
              resolve(true);
              return;
            } else {
              setLoading(false);
              completionRef.current = null;
              resolve(false);
              return;
            }
          } catch (err) {
            setLoading(false);
            completionRef.current = null;
            setError("Produkt konnte nicht geladen werden.");
            reject(err);
            return;
          }
        } catch (err) {
          setLoading(false);
          completionRef.current = null;
          const errorMsg =
            err instanceof Error
              ? err.message
              : "Produkt konnte nicht analysiert werden.";
          setError(errorMsg);
          reject(err);
        }
      });
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
