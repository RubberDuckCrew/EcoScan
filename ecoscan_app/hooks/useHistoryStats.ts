import { useCallback, useEffect, useState } from "react";
import { useApiClient } from "@/utils/apiClient";
import { HistoryStats } from "@/types/history/stats";

export function useHistoryStats() {
  const api = useApiClient();
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
      console.error("useHistoryStats fetch error", err);
    } finally {
      setLoading(false);
    }
  }, [api, loading]);

  useEffect(() => {
    void fetchStats();
  }, []);

  return {
    stats,
    loading,
    fetchStats,
  };
}
