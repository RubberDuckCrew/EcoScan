import {useApiClient} from "@/utils/apiClient";
import {useSseClient} from "@/utils/sseClient";
import {useCallback, useEffect, useRef, useState} from "react";

type UseAlternativesResult = {
    alternatives: Alternative[]
}

type Alternative = {

}
export function useAlternatives(): UseAlternativesResult {
    const api = useApiClient();
    const { startStream, closeStream } = useSseClient<Alternative[]>("product-score");
    const [loading, setLoading] = useState<boolean>(false);
    const [alternatives, setAlternatives] = useState<Alternative[]>([]);
    const [jobId, setJobId] = useState<string>();

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
                (recommendedAlternatives) => {
                    setAlternatives(recommendedAlternatives);
                    setLoading(false);
                    loadingRef.current = false;
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
                const jobId = await api.post(`alternatives/${productId}`, {
                    userCoordinates,
                    //TODO: hier alle infos für die Agenten schicken?
                });
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
        alternatives: []
    };
}