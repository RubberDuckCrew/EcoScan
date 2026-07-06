import { useApiClient } from "@/utils/apiClient";
import { useSseClient } from "@/utils/sseClient";
import { useCallback, useEffect, useRef, useState } from "react";
import { Product } from "@/types/product";

type UseAlternativesResult = {
  stores: NearbyStore[];
  alternatives: Alternative[];
  loading: boolean;
  fetchAlternatives: (
    productId: string,
    categories: string,
    userCoordinates: string,
  ) => Promise<void>;
  onError: (handler: (err?: any) => void) => void;
};

type Alternative = {
    ean: string;
}

type NearbyStore = {
  name: string;
  latitude: number;
  longitude: number;
};

export function useAlternatives(): UseAlternativesResult {
  const api = useApiClient();
  const { startStream: startEanStream, closeStream: closeEanStream } = useSseClient<string>("product-alternatives-eans");
  const { startStream: startStoreStream, closeStream: closeStoreStream } = useSseClient<NearbyStore>("product-alternatives-store");

  const [loading, setLoading] = useState<boolean>(false);

  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [stores, setStores] = useState<NearbyStore[]>([]);

  const loadingRef = useRef(false);
  const onErrorRef = useRef<(err?: any) => void>(() => {});

  const cleanupStreams = useCallback(() => {
        closeEanStream();
        closeStoreStream();
        setLoading(false);
        loadingRef.current = false;
        }, [closeEanStream, closeStoreStream]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

    const startSseListenerEans = useCallback(
        (jobId: string) => {
            startEanStream(
                `jobs/stream/${jobId}`,
                (rawData: any) => {
                    let data = rawData;
                    if (typeof rawData === 'string') {
                        try {
                            data = JSON.parse(rawData);
                        } catch (e) {
                            data = rawData;
                        }
                    }
                    if (data === "DONE" || data?.value === "DONE" || data?.done === true) {
                        console.info("EAN stream finished");
                        closeEanStream();
                        return;
                    }
                    const ean = typeof data === 'object' && data !== null ? data.value : data;
                    if (ean) {
                        console.info("EAN received: ", ean);
                        setAlternatives((prev) => [...prev, { ean }]);
                    }
                },
                () => {
                    closeEanStream();
                    setLoading(false);
                    loadingRef.current = false;
                },
            );
        },
        [startEanStream, closeEanStream],
    );

    const startSseListenerStores = useCallback(
        (jobId: string) => {
            startStoreStream(
                `jobs/stream/${jobId}`,
                (data: any) => {
                    if (data.done === true) {
                        closeStoreStream();
                        return;
                    }
                    const store = data as NearbyStore;
                    console.info("Store received: ", store);
                    setStores((prev) => [...prev, store]);
                    console.log(stores);
                },
                () => {
                    closeStoreStream();
                    setLoading(false);
                    loadingRef.current = false;
                },
            );
        },
        [startStoreStream, closeStoreStream],
    );

    const fetchAlternatives = useCallback(
        async (productId: string, categories: string, userCoordinates: string) => {
            if (loadingRef.current) return;

            setLoading(true);
            loadingRef.current = true;

            try {
                const jobs = await api.post(
                    `alternatives/${productId}?categories=${encodeURIComponent(categories)}&userCoordinates=${encodeURIComponent(userCoordinates)}`
                );
                console.log("jobs received:", jobs);

                if (jobs?.eanJobId) startSseListenerEans(jobs.eanJobId);
                if (jobs?.storeJobId) startSseListenerStores(jobs.storeJobId);
            } catch (e) {
                console.error("Error in fetchAlternatives", e);
                try { onErrorRef.current(e); } catch {}
                setLoading(false);
                loadingRef.current = false;
            }
        },
        [api, startSseListenerEans, startSseListenerStores],
    );

  return {
    alternatives,
    stores,
    loading,
    fetchAlternatives,
    onError: useCallback((handler: (err?: any) => void) => {
      onErrorRef.current = handler || (() => {});
    }, []),
  };
}
