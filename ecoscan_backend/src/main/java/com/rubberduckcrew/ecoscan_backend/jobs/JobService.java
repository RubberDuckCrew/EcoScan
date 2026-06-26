package com.rubberduckcrew.ecoscan_backend.jobs;

import com.rubberduckcrew.ecoscanai.model.GreenScoreResult;
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

    public void sendProductEvaluation(final UUID jobId, final GreenScoreResult score) {
        sseService.send(jobId, "product-evaluation", score);
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
