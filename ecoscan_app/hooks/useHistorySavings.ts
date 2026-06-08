import { useApiClient } from "@/utils/apiClient";
import { useCallback, useEffect, useState } from "react";
import { useSseClient } from "@/utils/sseClient";
import { HistorySavings } from "@/types/history/savings";

export function useHistorySavings() {
  const api = useApiClient();
  const { startStream, closeStream } =
    useSseClient<HistorySavings>("savings-evaluation");
  const [loading, setLoading] = useState<boolean>(false);
  const [savings, setSavings] = useState<HistorySavings>();
  const [jobId, setJobId] = useState<string>();

  useEffect(() => {
    if (!jobId) return;

    startSseListener(jobId);

    return () => {
      closeStream();
    };
  }, [jobId]);

  useEffect(() => {
    void fetchHistorySavings();
  }, []);

  const fetchHistorySavings = useCallback(async () => {
    if (loading || jobId) return;

    setLoading(true);

    try {
      const data = await api.post("history/savings");
      if (data) {
        setJobId(data);
      }
    } catch (err) {
      console.error("useHistorySavings fetch error", err);
      setLoading(false);
    }
  }, [api]);

  const startSseListener = useCallback(
    (jobId: string) => {
      startStream(
        `jobs/stream/${jobId}`,
        (result) => {
          setSavings(result);
          setLoading(false);
        },
        () => {
          setLoading(false);
          console.error("Error in SSE stream");
        },
      );
    },
    [startStream],
  );

  return {
    fetchHistorySavings,
    savings,
    loading,
    jobId,
  };
}
