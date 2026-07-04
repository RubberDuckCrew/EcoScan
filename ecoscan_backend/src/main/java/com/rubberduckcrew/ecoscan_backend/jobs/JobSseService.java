package com.rubberduckcrew.ecoscan_backend.jobs;

import com.rubberduckcrew.ecoscan_backend.common.SseService;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
@Slf4j
public class JobSseService extends SseService<UUID, JobSseService.JobState> {
    private static final long DEFAULT_TIMEOUT_MS = 600_000_000L;

    public UUID getOwner(final UUID jobId) {
        final JobState state = store.get(jobId);
        if (state == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found");
        }
        return state.ownerId;
    }

    public void register(final UUID jobId, final UUID userId) {
        final JobState state = store.computeIfAbsent(jobId, _ -> new JobState());
        withLock(state, () -> {
            state.ownerId = userId;
            return null;
        });
    }

    public boolean hasJob(final UUID jobId) {
        return store.containsKey(jobId);
    }

    public boolean isOwner(final UUID jobId, final UUID userId) {
        final JobState state = store.get(jobId);
        return state != null && userId.equals(state.ownerId);
    }

    public SseEmitter createEmitter(final UUID jobId, final UUID ownerId) {
        final JobState state = store.get(jobId);
        if (state == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found");
        }

        withLock(state, () -> {
            if (state.ownerId == null || !state.ownerId.equals(ownerId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
            }
            return null;
        });

        final SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT_MS);

        final List<BufferedItem> pending = withLock(state, () -> {
            state.emitter = emitter;
            final List<BufferedItem> items = new ArrayList<>(state.buffer);
            state.buffer.clear();
            return items;
        });

        emitter.onCompletion(() -> cleanup(jobId, state));
        emitter.onTimeout(() -> cleanup(jobId, state));
        emitter.onError(_ -> cleanup(jobId, state));

        for (final BufferedItem item : pending) {
            if (item instanceof BufferedItem.Complete) {
                emitter.complete();
                return emitter;
            }
            doSend(emitter, ((BufferedItem.Event) item).builder());
        }

        log.info("Created SSE emitter for job {}", jobId);
        return emitter;
    }

    public void send(final UUID jobId, final String eventName, final Object data) {
        final SseEmitter.SseEventBuilder builder = SseEmitter.event().name(eventName).data(data);
        final JobState state = store.computeIfAbsent(jobId, _ -> new JobState());

        final SseEmitter emitter = withLock(state, () -> {
            if (state.emitter == null && !state.completed) {
                state.buffer.add(new BufferedItem.Event(builder));
            }
            return state.emitter;
        });

        if (emitter != null) {
            log.info("Sending event to job {}: {}", jobId, eventName);
            doSend(emitter, builder);
        }
    }

    public void complete(final UUID jobId) {
        final JobState state = store.get(jobId);
        if (state == null) {
            return;
        }

        final SseEmitter emitter = withLock(state, () -> {
            state.completed = true;
            if (state.emitter == null) {
                state.buffer.add(new BufferedItem.Complete());
            }
            return state.emitter;
        });

        if (emitter != null) {
            store.remove(jobId);
            emitter.complete();
        }
    }

    private void cleanup(final UUID jobId, final JobState state) {
        withLock(state, () -> {
            state.completed = true;
            return null;
        });
        store.remove(jobId);
    }

    private sealed interface BufferedItem permits BufferedItem.Event, BufferedItem.Complete {
        record Event(SseEmitter.SseEventBuilder builder) implements BufferedItem {
        }

        record Complete() implements BufferedItem {
        }
    }

    protected static final class JobState extends LockableState {
        private final List<BufferedItem> buffer = new ArrayList<>();
        private SseEmitter emitter;
        private boolean completed = false;
        private UUID ownerId;
    }
}
