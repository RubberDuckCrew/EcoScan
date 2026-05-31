package com.rubberduckcrew.ecoscan_backend.jobs;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
public class SseService {

    private static final long DEFAULT_TIMEOUT_MS = 600_000L;

    private final Map<UUID, SseEmitter> emitters = new ConcurrentHashMap<>();
    private final Map<UUID, List<SseEmitter.SseEventBuilder>> bufferedEvents = new ConcurrentHashMap<>();

    public SseEmitter createEmitter(final UUID jobId) {
        final SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT_MS);

        emitters.put(jobId, emitter);

        emitter.onCompletion(() -> cleanupEmitter(jobId));
        emitter.onTimeout(() -> cleanupEmitter(jobId));
        emitter.onError((e) -> cleanupEmitter(jobId));

        final List<SseEmitter.SseEventBuilder> pending = bufferedEvents.remove(jobId);
        if (pending != null) {
            pending.forEach(event -> doSend(emitter, jobId, event));
        }

        return emitter;
    }

    public void send(final UUID jobId, final String eventName, final Object data) {
        final SseEmitter.SseEventBuilder event = SseEmitter.event()
                .name(eventName)
                .data(data);

        final SseEmitter emitter = emitters.get(jobId);
        if (emitter != null) {
            doSend(emitter, jobId, event);
        } else {
            bufferedEvents.computeIfAbsent(jobId, k -> new CopyOnWriteArrayList<>()).add(event);
        }
    }

    private void doSend(final SseEmitter emitter, final UUID jobId, final SseEmitter.SseEventBuilder event) {
        try {
            emitter.send(event);
        } catch (IOException e) {
            emitter.completeWithError(e);
            cleanupEmitter(jobId);
        }
    }

    public void complete(final UUID jobId) {
        final SseEmitter emitter = emitters.get(jobId);
        if (emitter != null) {
            emitter.complete();
        }
        cleanupEmitter(jobId);
    }

    private void cleanupEmitter(final UUID jobId) {
        emitters.remove(jobId);
        bufferedEvents.remove(jobId);
    }
}
