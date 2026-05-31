package com.rubberduckcrew.ecoscan_backend.jobs;

import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
@RequiredArgsConstructor
public class JobService {

    private final SseService sseService;

    public SseEmitter createJobEmitter(final UUID jobId) {
        return sseService.createEmitter(jobId);
    }

    public void sendProductScore(final UUID jobId, final int score) {
        sseService.send(jobId, "product-score", score);
        sseService.complete(jobId);
    }

    public void sendProcessingStatus(final UUID jobId, final String status) {
        sseService.send(jobId, "processing-status", status);
    }

    public void sendError(final UUID jobId, final String message) {
        sseService.send(jobId, "error", message);
        sseService.complete(jobId);
    }
}
