import {useApiClient} from "@/utils/apiClient";
import {useSseClient} from "@/utils/sseClient";
import {useCallback, useEffect, useRef, useState} from "react";
import {useGreenScore} from "@/hooks/useGreenScore";
import {Product} from "@/types/product";

type UseAlternativesResult = {
    alternatives: Alternative[];
    loading: boolean;
    fetchAlternatives: (productId: string, userCoordinates: string) => Promise<void>;
    onError: (handler: (err?: any) => void) => void;
}

type Alternative = Product;

type productJobId = Product | string;

type AlternativesSseResult = {
    ean: string;
    latitude: number;
    longitude: number;
};
export function useAlternatives(): UseAlternativesResult {
    const api = useApiClient();
    const { startStream, closeStream } = useSseClient<AlternativesSseResult[]>("product-alternatives");
    const [loading, setLoading] = useState<boolean>(false);
    const [alternatives, setAlternatives] = useState<Alternative[]>([]);

    const loadingRef = useRef(false);
    const onErrorRef = useRef<(err?: any) => void>(() => {});

    useEffect(() => {
        loadingRef.current = loading;
    }, [loading]);

    // useEffect(() => {
    //     if (!jobId) return;
    //     startSseListenerAgents(jobId);
    //     return () => {
    //         closeStream();
    //     };
    // }, [jobId]);

    // const fetchProductRaw = useCallback((ean: string) => {
    //     async (ean: string): Promise<Product | null> => {
    //         try {
    //             return await api.get(`product/${ean}`);
    //         } catch (e) {
    //             console.error("Error fetching alternative product", ean, e);
    //             return null;
    //         }
    //     },
    //     [api],
    // },[]);

    //TODO von markus
    const startSseListenerProduct = useCallback(() => { },[])

    const startSseListenerAgents = useCallback(
        (jobId: string) => {
            startStream(
                `jobs/stream/${jobId}`,
                (result: AlternativesSseResult[]) => {
                    console.info("result: ", result)
                    result.map(async ({ean}) => {
                        //Product oder JobId
                        // const product = await fetchProductRaw(ean);
                        //TODO Listener dafür aufrufen, wenn jobId
                        startSseListenerProduct();
                    })
                },
                () => {
                    //TODO als int
                    setLoading(false);
                    loadingRef.current = false;
                    try {
                        onErrorRef.current(
                            new Error("Error in SSE stream"),
                        );
                    } catch (e) {}
                    console.error("Error in SSE stream");
                },
            );
        },
        [startStream],
    );

    const fetchAlternatives = useCallback(
        async (productId: string, userCoordinates: string) => {
            if (loadingRef.current) return;

            setLoading(true);
            loadingRef.current = true;
            setAlternatives([]);

            try {
                const jobId = await api.post(
                    `alternatives/${productId}?userCoordinates=${encodeURIComponent(userCoordinates)}`
                );
                if (jobId) {
                    startSseListenerAgents(jobId);
                }
            } catch (e) {
                console.error("Error in fetchAlternatives", e);
                try {
                    onErrorRef.current(e);
                } catch {}

                setLoading(false);
                loadingRef.current = false;
            }
        }, [api]);

    const fetchGreenScore = useCallback(
        async (productId: string) => {
            if (loadingRef.current) return;
            setLoading(true);
            try {
                const data = await api.post(`score/${productId}`);
                if (data) {
                }
            } catch (err) {
                try {
                    onErrorRef.current("Produktscore konnte nicht geladen werden.");
                    setLoading(false);
                } catch (e) {}
            }
        },
        [api],
    );

    return {
        alternatives,
        loading,
        fetchAlternatives,
        onError: useCallback((handler: (err?: any) => void) => {
            onErrorRef.current = handler || (() => {});
        }, []),
    };
}