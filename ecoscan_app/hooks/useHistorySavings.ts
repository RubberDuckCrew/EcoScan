import { useApiClient } from "@/utils/apiClient";
import { useCallback, useEffect, useState } from "react";
import { useSseClient } from "@/utils/sseClient";
import { HistorySavings } from "@/types/history/savings";
import { useSnackbar } from "@/context/SnackbarContext";

export function useHistorySavings() {
  const api = useApiClient();
  const { showError } = useSnackbar();
  const { startStream, closeStream } =
    useSseClient<HistorySavings>("savings-evaluation");
  const [loading, setLoading] = useState<boolean>(false);
  const [savings, setSavings] = useState<HistorySavings>();
  const [jobId, setJobId] = useState<string>();

  const fetchHistorySavings = useCallback(async () => {
    if (loading) return;

    setLoading(true);

    try {
      const data = await api.post("history/savings");
      if (data) {
        setJobId(data);
      }
    } catch (err) {
      console.warn("[useHistorySavings]", err);
      showError("Fehler beim Abrufen der Ersparnisse.");
      setLoading(false);
    }
  }, [api, loading, showError]);

  const startSseListener = useCallback(
    (jobId: string) => {
      startStream(
        `jobs/stream/${jobId}`,
        (result) => {
          setSavings(result);
          setLoading(false);
          closeStream();
        },
        () => {
          setLoading(false);
          console.warn("Error in history SSE stream");
          closeStream();
        },
      );
    },
    [startStream, closeStream],
  );

  useEffect(() => {
    if (!jobId) return;

    startSseListener(jobId);

    return () => {
      closeStream();
    };
  }, [jobId, startSseListener, closeStream]);

  useEffect(() => {
    void fetchHistorySavings();
  }, [fetchHistorySavings]);

  return {
    fetchHistorySavings,
    savings,
    loading,
    jobId,
  };
}
