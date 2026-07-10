import { useCallback, useEffect, useRef, useState } from "react";
import { useApiClient } from "@/utils/apiClient";
import { HistoryStats } from "@/types/history/stats";
import { useSnackbar } from "@/context/SnackbarContext";

export function useHistoryStats() {
  const api = useApiClient();
  const { showError } = useSnackbar();
  const [stats, setStats] = useState<HistoryStats>();
  const [loading, setLoading] = useState<boolean>(false);
  const loadingRef = useRef(false);

  const fetchStats = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const data = await api.get(`history/stats`);
      const content = data as HistoryStats;
      setStats(content);
    } catch (err) {
      console.warn(
        "[useHistoryStats] Error while fetching history stats:",
        err,
      );
      showError("Fehler beim Abrufen der Statistiken.");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [api, showError]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    fetchStats,
  };
}
