import { useApiClient } from "@/utils/apiClient";
import { useSseClient } from "@/utils/sseClient";
import { useCallback, useRef, useState } from "react";

type UseAlternativesResult = {
  stores: NearbyStore[];
  alternatives: Alternative[];
  loadingEan: boolean;
  loadingStore: boolean;
  fetchAlternativeEans: (categories: string) => Promise<void>;
  fetchStores: (userCoordinates: string) => Promise<void>;
  onError: (handler: (err?: any) => void) => void;
};

type Alternative = {
  ean: string;
  name: string;
  imageUrl: string;
};

type NearbyStore = {
  name: string;
  latitude: number;
  longitude: number;
};

export function useAlternatives(): UseAlternativesResult {
  const api = useApiClient();
  const { startStream: startEanStream, closeStream: closeEanStream } =
    useSseClient<Alternative>("product-alternatives-eans");
  const { startStream: startStoreStream, closeStream: closeStoreStream } =
    useSseClient<NearbyStore>("product-alternatives-stores");

  const [loadingEan, setLoadingEan] = useState<boolean>(false);
  const [loadingStore, setLoadingStore] = useState<boolean>(false);

  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [stores, setStores] = useState<NearbyStore[]>([]);

  const loadingEanRef = useRef(false);
  const loadingStoreRef = useRef(false);

  const onErrorRef = useRef<(err?: any) => void>(() => {});

  const startSseListenerEans = useCallback(
    (jobId: string) => {
      startEanStream(
        `jobs/stream/${jobId}`,
        (alternative: Alternative) => {
          if (alternative.ean === "DONE") {
            console.info("EAN stream finished");
            closeEanStream();
            loadingEanRef.current = false;
            setLoadingEan(false);
            return;
          }
          if (alternative.name === "Produkt nicht gefunden") {
            return;
          }

          setAlternatives((prev) => {
            return [...prev, alternative];
          });
        },
        () => {
          closeEanStream();
          setLoadingEan(false);
          loadingEanRef.current = false;
        },
      );
    },
    [startEanStream, closeEanStream],
  );

  const startSseListenerStores = useCallback(
    (jobId: string) => {
      startStoreStream(
        `jobs/stream/${jobId}`,
        (store: NearbyStore) => {
          if (store.name === "DONE") {
            closeStoreStream();
            loadingStoreRef.current = false;
            setLoadingStore(false);
            return;
          }
          console.info("Store received: ", store);
          setStores((prev) => {
            return [...prev, store];
          });
        },
        () => {
          closeStoreStream();
          loadingStoreRef.current = false;
          setLoadingStore(false);
        },
      );
    },
    [startStoreStream, closeStoreStream],
  );

  const fetchAlternativeEans = useCallback(
    async (categories: string) => {
      if (loadingEanRef.current) return;
      loadingEanRef.current = true;
      setLoadingEan(true);
      setAlternatives([]);

      try {
        const jobId = await api.post(
          `alternatives/eans?categories=${encodeURIComponent(categories)}`,
        );
        if (jobId) startSseListenerEans(jobId);
      } catch (e) {
        console.error("Error in fetchAlternativeEans", e);
        setLoadingEan(false);
        loadingEanRef.current = false;
      }
    },
    [api, startSseListenerEans],
  );

  const fetchStores = useCallback(
    async (userCoordinates: string) => {
      if (loadingStoreRef.current) return;
      loadingStoreRef.current = true;
      setLoadingStore(true);
      setStores([]);

      try {
        const jobId = await api.post(
          `alternatives/stores?userCoordinates=${encodeURIComponent(userCoordinates)}`,
        );
        if (jobId) startSseListenerStores(jobId);
      } catch (e) {
        console.error("Error in fetchStores", e);
        setLoadingStore(false);
        loadingStoreRef.current = false;
      }
    },
    [api, startSseListenerStores],
  );

  return {
    alternatives,
    stores,
    loadingEan,
    loadingStore,
    fetchAlternativeEans,
    fetchStores,
    onError: useCallback((handler: (err?: any) => void) => {
      onErrorRef.current = handler || (() => {});
    }, []),
  };
}
