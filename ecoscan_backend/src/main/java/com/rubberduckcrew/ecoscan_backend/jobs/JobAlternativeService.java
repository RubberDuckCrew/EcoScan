package com.rubberduckcrew.ecoscan_backend.jobs;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.stereotype.Service;

@Service
public class JobAlternativeService {
    private final Map<UUID, UUID> jobAlternativeMap = new ConcurrentHashMap<>(); //Key: JobId von analyzeProduct oder greenScore, Value: jobId von findAlternatives
    private final Map<UUID, AtomicInteger> jobAlternativesCounter = new ConcurrentHashMap<>(); //Key: JobId von findAlternatives, Value: Anzahl ans Frontend gesendeter Alternativen

    public void register(final UUID jobIdAnalyzeProduct, final UUID jobIdAlternative) {
        if (jobIdAnalyzeProduct == null || jobIdAlternative == null) {
            return;
        }
        jobAlternativeMap.put(jobIdAnalyzeProduct, jobIdAlternative);
    }

    public Optional<UUID> getAlternativesJobId(final UUID jobIdAnalyzeProduct) {
        return Optional.ofNullable(jobAlternativeMap.get(jobIdAnalyzeProduct));
    }

    public void remove(final UUID jobIdAnalyzeProduct) {
        jobAlternativeMap.remove(jobIdAnalyzeProduct);
    }

    public boolean incrementAlternativesCounter(UUID jobIdAlternative) {
        if (jobIdAlternative == null) {
            return false;
        }

        AtomicInteger counter = jobAlternativesCounter.computeIfAbsent(
                jobIdAlternative,
                id -> new AtomicInteger(0));

        int value = counter.incrementAndGet();

        if (value == 5) {
            jobAlternativesCounter.remove(jobIdAlternative, counter);

            return true;
        }

        return false;
    }
}
