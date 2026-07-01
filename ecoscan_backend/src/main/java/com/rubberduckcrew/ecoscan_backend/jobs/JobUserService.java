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
public class JobUserService {
    private static final Duration JOB_TTL = Duration.ofMinutes(10);

    private final Cache<UUID, UUID> jobUserCache;
    private final Map<UUID, UUID> userJobMap = new ConcurrentHashMap<>();

    public JobUserService() {
        this.jobUserCache = Caffeine.newBuilder()
            .expireAfterWrite(JOB_TTL)
            .executor(Runnable::run)
            .removalListener((UUID jobId, UUID userId, RemovalCause cause) -> {
                userJobMap.remove(userId, jobId);
                if (cause == RemovalCause.EXPIRED) {
                    log.warn("Job {} for user {} expired without receiving an AI result", jobId, userId);
                }
            })
            .build();
    }

    public UUID register(final UUID userId) {
        return userJobMap.compute(userId, (_, existingJobId) -> {
            if (existingJobId != null && jobUserCache.getIfPresent(existingJobId) != null) {
                return existingJobId;
            }
            final UUID newJobId = UUID.randomUUID();
            jobUserCache.put(newJobId, userId);
            return newJobId;
        });
    }

    public Optional<UUID> getUserId(final UUID jobId) {
        return Optional.ofNullable(jobUserCache.getIfPresent(jobId));
    }

    public Optional<UUID> getJobId(final UUID userId) {
        final UUID jobId = userJobMap.get(userId);
        if (jobId == null) {
            return Optional.empty();
        }
        if (jobUserCache.getIfPresent(jobId) == null) {
            userJobMap.remove(userId, jobId);
            return Optional.empty();
        }
        return Optional.of(jobId);
    }

    public void remove(final UUID jobId) {
        jobUserCache.invalidate(jobId);
    }
}
