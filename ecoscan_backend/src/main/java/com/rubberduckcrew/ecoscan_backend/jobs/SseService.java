package com.rubberduckcrew.ecoscan_backend.jobs;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.locks.ReentrantLock;
import java.util.stream.IntStream;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
public class SseService {

    private static final long DEFAULT_TIMEOUT_MS = 600_000L;
    private static final int STRIPE_COUNT = 16;

    private final Map<UUID, SseEmitter> emitters = new ConcurrentHashMap<>();
    private final Map<UUID, List<BufferedItem>> bufferedEvents = new ConcurrentHashMap<>();

    private final ReentrantLock[] stripes = IntStream.range(0, STRIPE_COUNT)
            .mapToObj(i -> new ReentrantLock())
            .toArray(ReentrantLock[]::new);

    private sealed interface BufferedItem permits BufferedItem.Event, BufferedItem.Complete {
        record Event(SseEmitter.SseEventBuilder builder) implements BufferedItem {
        }

        record Complete() implements BufferedItem {
        }
    }

    private ReentrantLock lockFor(final UUID jobId) {
        return stripes[Math.floorMod(jobId.hashCode(), STRIPE_COUNT)];
    }

    public SseEmitter createEmitter(final UUID jobId) {
        final SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT_MS);
        emitter.onCompletion(() -> cleanupEmitter(jobId));
        emitter.onTimeout(() -> cleanupEmitter(jobId));
        emitter.onError((e) -> cleanupEmitter(jobId));

        final List<BufferedItem> pending;
        final ReentrantLock lock = lockFor(jobId);
        lock.lock();
        try {
            emitters.put(jobId, emitter);
            pending = bufferedEvents.remove(jobId);
        } finally {
            lock.unlock();
        }

        if (pending != null) {
            for (final BufferedItem item : pending) {
                switch (item) {
                case BufferedItem.Event(var builder) -> doSend(emitter, jobId, builder);
                case BufferedItem.Complete() -> {
                    emitter.complete();
                    return emitter;
                }
                }
            }
        }

        return emitter;
    }

    public void send(final UUID jobId, final String eventName, final Object data) {
        final SseEmitter.SseEventBuilder builder = SseEmitter.event().name(eventName).data(data);

        final SseEmitter emitter;
        final ReentrantLock lock = lockFor(jobId);
        lock.lock();
        try {
            emitter = emitters.get(jobId);
            if (emitter == null) {
                buffer(jobId, new BufferedItem.Event(builder));
            }
        } finally {
            lock.unlock();
        }

        if (emitter != null) {
            doSend(emitter, jobId, builder);
        }
    }

    public void complete(final UUID jobId) {
        final SseEmitter emitter;
        final ReentrantLock lock = lockFor(jobId);
        lock.lock();
        try {
            emitter = emitters.get(jobId);
            if (emitter == null) {
                buffer(jobId, new BufferedItem.Complete());
                return;
            }
            emitters.remove(jobId);
            bufferedEvents.remove(jobId);
        } finally {
            lock.unlock();
        }

        emitter.complete();
    }

    private void buffer(final UUID jobId, final BufferedItem item) {
        bufferedEvents.computeIfAbsent(jobId, k -> new CopyOnWriteArrayList<>()).add(item);
    }

    private void doSend(final SseEmitter emitter, final UUID jobId, final SseEmitter.SseEventBuilder event) {
        try {
            emitter.send(event);
        } catch (IOException e) {
            emitter.completeWithError(e);
            cleanupEmitter(jobId);
        }
    }

    private void cleanupEmitter(final UUID jobId) {
        final ReentrantLock lock = lockFor(jobId);
        lock.lock();
        try {
            emitters.remove(jobId);
            bufferedEvents.remove(jobId);
        } finally {
            lock.unlock();
        }
    }
}
