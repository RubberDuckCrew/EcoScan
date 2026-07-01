package com.rubberduckcrew.ecoscan_backend.jobs;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class JobUserService {
    private final Map<UUID, UUID> jobUserMap = new ConcurrentHashMap<>();

    public void register(final UUID jobId, final UUID userId) {
        jobUserMap.put(jobId, userId);
    }

    public Optional<UUID> getUserId(final UUID jobId) {
        return Optional.ofNullable(jobUserMap.get(jobId));
    }

    public void remove(final UUID jobId) {
        jobUserMap.remove(jobId);
    }
}
