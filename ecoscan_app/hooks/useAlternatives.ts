import {useApiClient} from "@/utils/apiClient";
import {useSseClient} from "@/utils/sseClient";
import {useCallback, useEffect, useRef, useState} from "react";
import {useGreenScore} from "@/hooks/useGreenScore";

type UseAlternativesResult = {
    alternatives: Alternative[];
    loading: boolean;
    fetchAlternatives: (productId: string, userCoordinates: string) => Promise<void>;
    onError: (handler: (err?: any) => void) => void;
}

type Alternative = string;
export function useAlternatives(): UseAlternativesResult {
    const api = useApiClient();
    const { startStream, closeStream } = useSseClient<Alternative[]>("product-score");
    const [loading, setLoading] = useState<boolean>(false);
    const [alternatives, setAlternatives] = useState<Alternative[]>([]);
    const [jobId, setJobId] = useState<string>();
    const { fetchProduct, fetchGreenScore } = useGreenScore();

    const loadingRef = useRef(false);
    const onErrorRef = useRef<(err?: any) => void>(() => {});

    useEffect(() => {
        loadingRef.current = loading;
    }, [loading]);

    useEffect(() => {
        if (!jobId) return;
        startSseListener(jobId);
        return () => {
            closeStream();
        };
    }, [jobId]);

    const startSseListener = useCallback(
        (jobId: string) => {
            startStream(
                `jobs/stream/${jobId}`,
                (recommendedEans) => {
                    recommendedEans.forEach(async (ean) => {
                        const product = await fetchProduct(ean);
                        if (product && product.score === undefined) {
                            await fetchGreenScore(ean);
                        }
                    });
                },
                () => {
                    setLoading(false);
                    loadingRef.current = false;
                    const err = new Error("Error in SSE stream");
                    try {
                        onErrorRef.current(err);
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
                    setJobId(jobId);
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

    return {
        alternatives,
        loading,
        fetchAlternatives,
        onError: useCallback((handler: (err?: any) => void) => {
            onErrorRef.current = handler || (() => {});
        }, []),
    };
}