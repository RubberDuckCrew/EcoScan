package com.rubberduckcrew.ecoscan_backend.jobs;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class JobAlternativeService {
    private final Map<UUID, UUID> jobAlternativeMap = new ConcurrentHashMap<>(); //Key: JobId von analyzeProduct oder greenScore, Value: jobId von findAlternatives
    private final Map<UUID, AtomicInteger> jobAlternativesCounter = new ConcurrentHashMap<>(); //Key: JobId von findAlternatives, Value: Anzahl ans Frontend gesendeter Alternativen
    private final Map<UUID, AtomicInteger> jobAlternativesExpectedCounter = new ConcurrentHashMap<>();

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

    public boolean incrementAlternativesCounter(final UUID jobIdAlternative) {
        if (jobIdAlternative == null) {
            return false;
        }

        final AtomicInteger counter = jobAlternativesCounter.computeIfAbsent(
            jobIdAlternative,
            id -> new AtomicInteger(0));

        final int value = counter.incrementAndGet();

        final AtomicInteger expected = jobAlternativesExpectedCounter.get(jobIdAlternative);
        if (value >= expected.get()) {
            log.info("Limit reached, return completed=true");
            jobAlternativesCounter.remove(jobIdAlternative, counter);
            jobAlternativesExpectedCounter.remove(jobIdAlternative, expected);
            return true;
        }

        return false;
    }

    public void registerAlternativesJob(final UUID jobIdAlternative, final int expectedCount) {
        jobAlternativesCounter.put(jobIdAlternative, new AtomicInteger(0));
        jobAlternativesExpectedCounter.put(jobIdAlternative, new AtomicInteger(expectedCount));
    }
}
