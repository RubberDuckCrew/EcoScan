package com.rubberduckcrew.ecoscan_backend.jobs;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
public class SseService {

    private final Map<UUID, SseEmitter> emitters = new ConcurrentHashMap<>();
    private final Map<UUID, Integer> bufferedScores = new ConcurrentHashMap<>();

    public SseEmitter createEmitter(final UUID jobId) {
        final SseEmitter emitter = new SseEmitter(600_000L);

        emitters.put(jobId, emitter);

        emitter.onCompletion(() -> cleanupEmitter(jobId));
        emitter.onTimeout(() -> cleanupEmitter(jobId));
        emitter.onError((e) -> cleanupEmitter(jobId));

        final Integer bufferedScore = bufferedScores.get(jobId);
        if (bufferedScore != null) {
            sendSse(jobId, bufferedScore, "product-score");
        }

        return emitter;
    }

    public void sendProductScore(final UUID jobId, final int score) {
        bufferedScores.put(jobId, score);
        sendSse(jobId, score, "product-score");
    }

    private void sendSse(final UUID jobId, final Object data, final String event) {
        final SseEmitter emitter = emitters.get(jobId);
        if (emitter == null) {
            return;
        }
        try {
            emitter.send(SseEmitter.event()
                    .name(event)
                    .data(data));

            emitter.complete();
        } catch (IOException e) {
            emitter.completeWithError(e);
            emitters.remove(jobId);
        }
    }

    private void cleanupEmitter(final UUID jobId) {
        emitters.remove(jobId);
        bufferedScores.remove(jobId);
    }
}
