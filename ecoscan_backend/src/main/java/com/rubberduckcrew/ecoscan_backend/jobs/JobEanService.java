package com.rubberduckcrew.ecoscan_backend.jobs;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class JobEanService {
    private final Map<UUID, String> jobEanMap = new ConcurrentHashMap<>();
    private final Map<String, UUID> eanJobMap = new ConcurrentHashMap<>();

    public void register(final UUID jobId, final String ean) {
        jobEanMap.put(jobId, ean);
        eanJobMap.put(ean, jobId);
    }

    public Optional<String> getEan(final UUID jobId) {
        return Optional.ofNullable(jobEanMap.get(jobId));
    }

    public Optional<UUID> getJobId(final String ean) {
        return Optional.ofNullable(eanJobMap.get(ean));
    }

    public void remove(final UUID jobId) {
        final String ean = jobEanMap.remove(jobId);
        if (ean != null) {
            eanJobMap.remove(ean);
        }
    }
}
