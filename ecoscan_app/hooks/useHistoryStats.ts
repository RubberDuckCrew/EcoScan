import { useCallback, useEffect, useState } from "react";
import { useApiClient } from "@/utils/apiClient";
import { HistoryStats } from "@/types/history/stats";
import { useSnackbar } from "@/context/SnackbarContext";

export function useHistoryStats() {
  const api = useApiClient();
  const { showError } = useSnackbar();
  const [stats, setStats] = useState<HistoryStats>();
  const [loading, setLoading] = useState<boolean>(false);

  const fetchStats = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await api.get(`history/stats`);
      const content = data as HistoryStats;
      setStats(content);
    } catch (err) {
      console.warn("[useHistoryStats]", err);
      showError("Fehler beim Abrufen der Statistiken.");
    } finally {
      setLoading(false);
    }
  }, [api, loading, showError]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    fetchStats,
  };
}
