package com.rubberduckcrew.ecoscan_backend.jobs;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class JobAlternativeService {
    private final Map<UUID, UUID> jobAlternativeMap = new ConcurrentHashMap<>(); //Key: JobId von analyzeProduct, value, jobId von alternativen suchen

    public void register(final UUID jobIdAnalyzeProduct, final UUID jobIdAlternative) {
        jobAlternativeMap.put(jobIdAnalyzeProduct, jobIdAlternative);
    }

    public Optional<UUID> getAlternativesJobId(final UUID jobIdAnalyzeProduct) {
        return Optional.ofNullable(jobAlternativeMap.get(jobIdAnalyzeProduct));
    }

    public void remove(final UUID jobIdAnalyzeProduct) {
        jobAlternativeMap.remove(jobIdAnalyzeProduct);
    }
}
