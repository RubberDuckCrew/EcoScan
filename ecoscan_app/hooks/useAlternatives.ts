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

    return {
        alternatives: []
    };
}
