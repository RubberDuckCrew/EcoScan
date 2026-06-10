import { useCallback, useEffect, useState } from "react";
import { useApiClient } from "@/utils/apiClient";
import type { HistoryItem } from "@/types/history/item";

export function useHistoryList() {
  const api = useApiClient();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchPage = useCallback(
    async (pageToLoad: number) => {
      if (loading) return;
      setLoading(true);
      try {
        const data = await api.get(`history/list?page=${pageToLoad}`);
        const content: HistoryItem[] = Array.isArray(data?.content)
          ? data.content
          : [];

        setHistory((prev) =>
          pageToLoad === 0 ? content : [...prev, ...data.content],
        );
        setPage(
          typeof data?.currentPage === "number" ? data.currentPage : pageToLoad,
        );
        setHasMore(Boolean(data?.hasNext));
      } catch (err) {
        console.error("useHistoryList fetch error", err);
      } finally {
        setLoading(false);
      }
    },
    [api, loading],
  );

  const loadNext = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchPage(page + 1);
  }, [fetchPage, hasMore, loading, page]);

  const refresh = useCallback(async () => {
    if (loading) return;
    setRefreshing(true);
    try {
      await fetchPage(0);
    } finally {
      setRefreshing(false);
    }
  }, [fetchPage, loading]);

  useEffect(() => {
    void fetchPage(0);
  }, []);

  return {
    history,
    page,
    hasMore,
    loading,
    loadNext,
    refresh,
    refreshing,
  };
}
