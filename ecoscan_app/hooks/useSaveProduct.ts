import { useApiClient } from "@/utils/apiClient";
import { useCallback, useState } from "react";

type UseSaveProductReturn = {
  saveProduct: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  success: boolean;
  saved: boolean;
  resetSaved: () => void;
};

export function useSaveProduct(): UseSaveProductReturn {
  const api = useApiClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveProduct = useCallback(
    async (id: string) => {
      if (saved) return;

      setLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const data = await api.post(`history/${id}`);
        if (!data) {
          throw new Error("Keine Daten erhalten");
        }
        setSuccess(true);
        setSaved(true);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Ein Fehler ist aufgetreten",
        );
      } finally {
        setLoading(false);
      }
    },
    [api, saved],
  );
  const resetSaved = useCallback(() => setSaved(false), []);

  return { saveProduct, loading, error, success, saved, resetSaved };
}
