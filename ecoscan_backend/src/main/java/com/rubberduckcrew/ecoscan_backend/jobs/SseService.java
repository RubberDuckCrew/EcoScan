package com.rubberduckcrew.ecoscan_backend.jobs;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
public class SseService {

    private static final long DEFAULT_TIMEOUT_MS = 600_000L;

    private final Map<UUID, JobState> jobs = new ConcurrentHashMap<>();

    public SseEmitter createEmitter(final UUID jobId) {
        final SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT_MS);
        final JobState state = jobs.computeIfAbsent(jobId, k -> new JobState());

        final List<BufferedItem> pending;
        state.lock.lock();
        try {
            state.emitter = emitter;
            pending = new ArrayList<>(state.buffer);
            state.buffer.clear();
        } finally {
            state.lock.unlock();
        }

        emitter.onCompletion(() -> cleanup(jobId, state));
        emitter.onTimeout(() -> cleanup(jobId, state));
        emitter.onError(e -> cleanup(jobId, state));

        for (final BufferedItem item : pending) {
            if (item instanceof BufferedItem.Complete) {
                emitter.complete();
                return emitter;
            }
            doSend(emitter, ((BufferedItem.Event) item).builder());
        }

        return emitter;
    }

    public void send(final UUID jobId, final String eventName, final Object data) {
        final SseEmitter.SseEventBuilder builder = SseEmitter.event().name(eventName).data(data);
        final JobState state = jobs.computeIfAbsent(jobId, k -> new JobState());

        final SseEmitter emitter;
        state.lock.lock();
        try {
            emitter = state.emitter;
            if (emitter == null && !state.completed) {
                state.buffer.add(new BufferedItem.Event(builder));
                return;
            }
        } finally {
            state.lock.unlock();
        }

        if (emitter != null) {
            doSend(emitter, builder);
        }
    }

    public void complete(final UUID jobId) {
        final JobState state = jobs.get(jobId);
        if (state == null) {
            return;
        }

        final SseEmitter emitter;
        state.lock.lock();
        try {
            state.completed = true;
            emitter = state.emitter;
            if (emitter == null) {
                state.buffer.add(new BufferedItem.Complete());
                return;
            }
        } finally {
            state.lock.unlock();
        }

        jobs.remove(jobId);
        emitter.complete();
    }

    private void cleanup(final UUID jobId, final JobState state) {
        state.lock.lock();
        try {
            state.completed = true;
        } finally {
            state.lock.unlock();
        }
        jobs.remove(jobId);
    }

    private void doSend(final SseEmitter emitter, final SseEmitter.SseEventBuilder event) {
        try {
            emitter.send(event);
        } catch (final IOException e) {
            emitter.completeWithError(e);
        }
    }

    private sealed interface BufferedItem permits BufferedItem.Event, BufferedItem.Complete {
        record Event(SseEmitter.SseEventBuilder builder) implements BufferedItem {
        }

        record Complete() implements BufferedItem {
        }
    }

    private static final class JobState {
        private final List<BufferedItem> buffer = new ArrayList<>();
        private final ReentrantLock lock = new ReentrantLock();
        private SseEmitter emitter;
        private boolean completed = false;
    }
}
