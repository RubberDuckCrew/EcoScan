import { useEffect, useState } from "react";
import { useProduct } from "@/context/ProductContext";
import { useGreenScore } from "@/hooks/useGreenScore";
import { useApiClient } from "@/utils/apiClient";

export function useProductData(id: string | string[] | undefined) {
  const api = useApiClient();
  const { product, setProduct } = useProduct();
  const [productLoading, setProductLoading] = useState(false);

  const [productError, setProductError] = useState<string | undefined>();

  const {
    loading: scoreLoading,
    error: scoreError,
    fetchGreenScore,
    cancelGreenScore,
  } = useGreenScore();

  useEffect(() => {
    const normalizedId = Array.isArray(id) ? id[0] : id;
    if (!normalizedId) return;

    let cancelled = false;

    async function loadProduct() {
      setProductLoading(true);
      setProduct(undefined);
      setProductError(undefined);

      try {
        const data = await api.get(`product/${normalizedId}`);
        if (cancelled) return;

        if (data) {
          setProduct(data);
          if (data.score === undefined) {
            await fetchGreenScore(normalizedId);
          }
        }
      } catch (err) {
        console.warn("Failed to load product:", err);
        if (cancelled) return;
        setProductError("Produkt konnte nicht geladen werden.");
      } finally {
        if (!cancelled) setProductLoading(false);
      }
    }

    void loadProduct();

    return () => {
      cancelled = true;
      cancelGreenScore();
    };
  }, [id, api, setProduct, fetchGreenScore, cancelGreenScore]);

  return {
    product,
    productLoading,
    scoreLoading,
    error: productError || scoreError,
  };
}
