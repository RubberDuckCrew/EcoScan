package com.rubberduckcrew.ecoscan_backend.jobs;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class JobEanService {
    private final Map<UUID, String> jobEanMap = new ConcurrentHashMap<>();

    public void register(final UUID jobId, final String ean) {
        jobEanMap.put(jobId, ean);
    }

    public Optional<String> getEan(final UUID jobId) {
        return Optional.ofNullable(jobEanMap.get(jobId));
    }

    public void remove(final UUID jobId) {
        jobEanMap.remove(jobId);
    }
}
