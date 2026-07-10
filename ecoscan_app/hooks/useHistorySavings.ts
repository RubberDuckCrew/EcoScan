import { useApiClient } from "@/utils/apiClient";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSseClient } from "@/utils/sseClient";
import { HistorySavings } from "@/types/history/savings";
import { useSnackbar } from "@/context/SnackbarContext";

export function useHistorySavings() {
  const api = useApiClient();
  const { showError } = useSnackbar();
  const { startStream, closeStream } =
    useSseClient<HistorySavings>("savings-evaluation");
  const [loading, setLoading] = useState<boolean>(false);
  const loadingRef = useRef(false);
  const [savings, setSavings] = useState<HistorySavings>();
  const [jobId, setJobId] = useState<string>();

  const requestSavings = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const data = await api.post("history/savings");
      if (data) {
        setJobId(data);
      }
    } catch (err) {
      console.warn("[useHistorySavings] Error while requesting savings:", err);
      showError("Fehler beim Abrufen der Ersparnisse.");
      loadingRef.current = false;
      setLoading(false);
    }
  }, [api, showError]);

  const startSseListener = useCallback(
    (jobId: string) => {
      startStream(
        `jobs/stream/${jobId}`,
        (result) => {
          setSavings(result);
          loadingRef.current = false;
          setLoading(false);
          closeStream();
        },
        (error) => {
          loadingRef.current = false;
          setLoading(false);
          console.warn("[useHistorySavings] Error in SSE stream:", error);
          showError("Fehler beim Abrufen der Ersparnisse.");
          closeStream();
        },
      );
    },
    [startStream, closeStream, showError],
  );

  useEffect(() => {
    if (!jobId) return;

    startSseListener(jobId);

    return () => {
      closeStream();
    };
  }, [jobId, startSseListener, closeStream]);

  useEffect(() => {
    void requestSavings();
  }, [requestSavings]);

  return {
    requestSavings,
    savings,
    loading,
    jobId,
  };
}
