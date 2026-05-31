import { useApiClient } from "@/utils/apiClient";
import { useEffect, useState } from "react";
import { Product } from "@/types/product";
import { useSseClient } from "@/utils/sseClient";

type UseGreenScoreResult = {
  loading: boolean;
  product?: Product;
  jobId?: string;
  fetchGreenScore: (productId: string) => Promise<void>;
  fetchProduct: (productId: string) => Promise<void>;
};

export function useGreenScore(): UseGreenScoreResult {
  const api = useApiClient();
  const { startStream, closeStream } = useSseClient<number>("product-score");
  const [loading, setLoading] = useState<boolean>(false);
  const [product, setProduct] = useState<Product>();
  const [jobId, setJobId] = useState<string>();

  useEffect(() => {
    if (!jobId) return;

    startSseListener(jobId);

    return () => {
      closeStream();
    };
  }, [jobId]);

  const fetchGreenScore = async (productId: string) => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await api.post(`score/${productId}`);
      if (data) {
        setJobId(data);
      }
    } catch (err) {
      console.error("useGreenScore fetch error", err);
    }
  };

  const fetchProduct = async (productId: string) => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await api.get(`product/${productId}`);
      if (data) {
        setProduct(data);
        return data;
      }
    } catch (err) {
      console.error("fetchProduct fetch error", err);
    } finally {
      setLoading(false);
    }
    console.log(product);
  };

  const startSseListener = (jobId: string) => {
    startStream(
      `jobs/stream/${jobId}`,
      (score) => {
        setProduct((prev) => (prev ? { ...prev, score } : undefined));
        setLoading(false);
      },
      () => {
        console.error(`Error in SSE stream`);
      },
    );
  };
  return { fetchGreenScore, fetchProduct, product, loading, jobId };
}
