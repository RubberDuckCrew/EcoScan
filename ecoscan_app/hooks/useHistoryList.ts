import { useCallback, useEffect, useRef, useState } from "react";
import { useApiClient } from "@/utils/apiClient";
import type { HistoryItem } from "@/types/history/item";
import { useSnackbar } from "@/context/SnackbarContext";

export function useHistoryList() {
  const api = useApiClient();
  const { showError } = useSnackbar();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const loadingRef = useRef(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchPage = useCallback(
    async (pageToLoad: number) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      try {
        const data = await api.get(`history/list?page=${pageToLoad}`);
        const content: HistoryItem[] = Array.isArray(data?.content)
          ? data.content
          : [];

        setHistory((prev) =>
          pageToLoad === 0 ? content : [...prev, ...content],
        );
        setPage(
          typeof data?.currentPage === "number" ? data.currentPage : pageToLoad,
        );
        setHasMore(Boolean(data?.hasNext));
      } catch (err) {
        console.warn(
          "[useHistoryList] Error while fetching history page:",
          err,
        );
        showError("Fehler beim Laden der Historie.");
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [api, showError],
  );

  const loadNext = useCallback(async () => {
    if (!hasMore || loadingRef.current) return;
    await fetchPage(page + 1);
  }, [fetchPage, hasMore, page]);

  const refresh = useCallback(async () => {
    if (loadingRef.current) return;
    setRefreshing(true);
    try {
      await fetchPage(0);
    } finally {
      setRefreshing(false);
    }
  }, [fetchPage]);

  useEffect(() => {
    void fetchPage(0);
  }, [fetchPage]);

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
