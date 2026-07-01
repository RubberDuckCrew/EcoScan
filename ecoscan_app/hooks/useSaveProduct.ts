import { useApiClient } from "@/utils/apiClient";
import { useCallback, useState } from "react";

type UseSaveProductReturn = {
  saveProduct: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  success: boolean;
};

export function useSaveProduct(): UseSaveProductReturn {
  const api = useApiClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const saveProduct = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const data = await api.post(`history/${id}`);
        if (!data) {
          throw new Error("Keine Daten erhalten");
        }
        setSuccess(true);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Ein Fehler ist aufgetreten",
        );
      } finally {
        setLoading(false);
      }
    },
    [api],
  );

  return { saveProduct, loading, error, success };
}
