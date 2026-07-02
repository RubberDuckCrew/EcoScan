package com.rubberduckcrew.ecoscan_backend.jobs;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.RemovalCause;
import java.time.Duration;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class JobEanService {
    private static final Duration JOB_TTL = Duration.ofMinutes(30);

    private final Cache<UUID, String> jobEanCache;
    private final Map<String, UUID> eanJobMap = new ConcurrentHashMap<>();

    public JobEanService() {
        this.jobEanCache = Caffeine.newBuilder()
            .expireAfterWrite(JOB_TTL)
            .executor(Runnable::run)
            .removalListener((UUID jobId, String ean, RemovalCause cause) -> {
                eanJobMap.remove(ean, jobId);
                if (cause == RemovalCause.EXPIRED) {
                    log.warn("Job {} for EAN {} expired without receiving an AI result", jobId, ean);
                }
            })
            .build();
    }

    public void register(final UUID jobId, final String ean) {
        jobEanCache.put(jobId, ean);
        eanJobMap.put(ean, jobId);
    }

    public Optional<String> getEan(final UUID jobId) {
        return Optional.ofNullable(jobEanCache.getIfPresent(jobId));
    }

    public Optional<UUID> getJobId(final String ean) {
        final UUID jobId = eanJobMap.get(ean);
        if (jobId == null) {
            return Optional.empty();
        }
        if (jobEanCache.getIfPresent(jobId) == null) {
            eanJobMap.remove(ean, jobId);
            return Optional.empty();
        }
        return Optional.of(jobId);
    }

    public void remove(final UUID jobId) {
        final String ean = jobEanCache.getIfPresent(jobId);
        if (ean != null) {
            jobEanCache.invalidate(jobId);
            eanJobMap.remove(ean, jobId);
        }
    }
}
