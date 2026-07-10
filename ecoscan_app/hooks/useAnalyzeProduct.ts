import { useApiClient } from "@/utils/apiClient";
import { useProduct } from "@/context/ProductContext";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSseClient } from "@/utils/sseClient";
import { Product } from "@/types/product";

type UseAnalyzeProductResult = {
  loading: boolean;
  analyzeProduct: (productId: string) => Promise<boolean>;
  cancelAnalysis: () => void;
};

export function useAnalyzeProduct(): UseAnalyzeProductResult {
  const api = useApiClient();
  const { setProduct } = useProduct();
  const [loading, setLoading] = useState<boolean>(false);
  const { startStream, closeStream } = useSseClient<Product>(
    "product-analysis-evaluation",
  );

  const completionRef = useRef<{
    resolve: (ok: boolean) => void;
    reject: (err?: any) => void;
  } | null>(null);

  const handleStreamError = useCallback(
    (err?: any) => {
      closeStream();
      setLoading(false);
      const errorMsg =
        err instanceof Error && err.name === "AbortError"
          ? "Analyse abgebrochen"
          : "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.";
      console.warn("[useAnalyzeProduct] SSE stream error:", err);
      completionRef.current?.reject(new Error(errorMsg));
      completionRef.current = null;
    },
    [closeStream],
  );

  const handleStreamSuccess = useCallback(
    (result: Product) => {
      setProduct(() => result);
      setLoading(false);
      closeStream();
      completionRef.current?.resolve(true);
      completionRef.current = null;
    },
    [setProduct, closeStream],
  );

  const cancelAnalysis = useCallback(() => {
    setLoading(false);
    closeStream();
    completionRef.current?.reject(
      new Error("Analyse abgebrochen vom Benutzer"),
    );
    completionRef.current = null;
  }, [closeStream]);

  const analyzeProduct = useCallback(
    async (productId: string): Promise<boolean> => {
      if (completionRef.current) {
        throw new Error("Eine Produktanalyse läuft bereits.");
      }
      setLoading(true);
      try {
        const jobId = await api.post(`product/analyze/${productId}`);
        if (!jobId) {
          const productData = await api.get(`product/${productId}`);
          setLoading(false);
          if (productData) {
            setProduct(productData);
            return true;
          }
          return false;
        }
        return new Promise<boolean>((resolve, reject) => {
          completionRef.current = { resolve, reject };
          startStream(
            `jobs/stream/${jobId}`,
            handleStreamSuccess,
            handleStreamError,
          );
        });
      } catch (err) {
        setLoading(false);
        console.warn("[useAnalyzeProduct] analyzeProduct failed:", err);
        throw err;
      }
    },
    [api, setProduct, startStream, handleStreamSuccess, handleStreamError],
  );

  useEffect(() => {
    return () => {
      closeStream();
      completionRef.current?.reject(new Error("Component unmounted"));
      completionRef.current = null;
    };
  }, [closeStream]);

  return { loading, analyzeProduct, cancelAnalysis };
}
