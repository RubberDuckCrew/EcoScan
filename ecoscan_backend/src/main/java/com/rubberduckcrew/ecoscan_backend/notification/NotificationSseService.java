package com.rubberduckcrew.ecoscan_backend.notification;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Slf4j
@RequiredArgsConstructor
@Service
public class NotificationSseService {
    private static final long SSE_TIMEOUT_MS = 600_000L;
    private final NotificationMapper notificationMapper;
    private final Map<UUID, UserState> connections = new ConcurrentHashMap<>();

    public SseEmitter createEmitter(final UUID userId) {
        final SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);
        final UserState state = connections.computeIfAbsent(userId, k -> new UserState());

        final List<NotificationDTO> pending;
        state.lock.lock();
        try {
            state.emitters.add(emitter);
            pending = List.copyOf(state.buffer);
        } finally {
            state.lock.unlock();
        }

        emitter.onCompletion(() -> cleanup(userId, emitter));
        emitter.onTimeout(() -> cleanup(userId, emitter));
        emitter.onError(_ -> cleanup(userId, emitter));

        boolean allSent = true;
        for (final NotificationDTO notification : pending) {
            if (!doSend(emitter, notification)) {
                allSent = false;
            }
        }

        if (allSent) {
            state.lock.lock();
            try {
                state.buffer.removeIf(n -> {
                    for (final NotificationDTO p : pending) if (n == p) return true;
                    return false;
                });
            } finally {
                state.lock.unlock();
            }
        }

        log.info("Created SSE emitter for user {}", userId);
        return emitter;
    }

    public void sendNotification(final UUID userId, final Notification notification) {
        final NotificationDTO notificationDTO = notificationMapper.toDTO(notification, Instant.now());
        log.info("Sending notification to user {}: {}", userId, notificationDTO);
        final UserState state = connections.computeIfAbsent(userId, _ -> new UserState());

        final List<SseEmitter> emitters;
        state.lock.lock();
        try {
            emitters = List.copyOf(state.emitters);
            if (emitters.isEmpty()) {
                state.buffer.add(notificationDTO);
                return;
            }
        } finally {
            state.lock.unlock();
        }

        boolean anySent = false;
        for (final SseEmitter emitter : emitters) {
            if (doSend(emitter, notificationDTO)) {
                anySent = true;
            }
        }

        if (!anySent) {
            state.lock.lock();
            try {
                state.buffer.add(notificationDTO);
            } finally {
                state.lock.unlock();
            }
        }
    }

    private void cleanup(final UUID userId, final SseEmitter emitter) {
        connections.computeIfPresent(userId, (_, state) -> {
            state.lock.lock();
            try {
                state.emitters.remove(emitter);
                if (state.emitters.isEmpty() && state.buffer.isEmpty()) {
                    return null;
                }
            } finally {
                state.lock.unlock();
            }
            return state;
        });
    }

    private boolean doSend(final SseEmitter emitter, final NotificationDTO notification) {
        try {
            emitter.send(SseEmitter.event().name("notification").data(notification));
            return true;
        } catch (final IOException e) {
            try {
                emitter.completeWithError(e);
            } catch (final Exception _) {
            }
            return false;
        }
    }

    private static final class UserState {
        private final List<SseEmitter> emitters = new ArrayList<>();
        private final List<NotificationDTO> buffer = new ArrayList<>();
        private final ReentrantLock lock = new ReentrantLock();
    }
}
