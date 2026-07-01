package com.rubberduckcrew.ecoscan_backend.notification;

import com.rubberduckcrew.ecoscan_backend.notification.dto.NotificationDTO;
import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Slf4j
@Service
public class NotificationSseService {

    private static final long SSE_TIMEOUT_MS = 600_000L;

    private final Map<UUID, UserState> connections = new ConcurrentHashMap<>();

    public SseEmitter createEmitter(final UUID userId) {
        final SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);
        final UserState state = connections.computeIfAbsent(userId, k -> new UserState());

        final List<NotificationDTO> pending;
        state.lock.lock();
        try {
            state.emitters.add(emitter);
            pending = List.copyOf(state.buffer);
            state.buffer.clear();
        } finally {
            state.lock.unlock();
        }

        emitter.onCompletion(() -> cleanup(userId, emitter));
        emitter.onTimeout(() -> cleanup(userId, emitter));
        emitter.onError(e -> cleanup(userId, emitter));

        for (final NotificationDTO notification : pending) {
            doSend(emitter, notification);
        }

        log.info("Created SSE emitter for user {}", userId);
        return emitter;
    }

    public void sendNotification(final UUID userId, final String title, final String message) {
        final NotificationDTO notification = new NotificationDTO(title, message, Instant.now());
        log.info("Sending notification to user {}: {}", userId, notification);
        final UserState state = connections.computeIfAbsent(userId, k -> new UserState());

        final List<SseEmitter> emitters;
        state.lock.lock();
        try {
            emitters = List.copyOf(state.emitters);
            if (emitters.isEmpty()) {
                state.buffer.add(notification);
                return;
            }
        } finally {
            state.lock.unlock();
        }

        for (final SseEmitter emitter : emitters) {
            doSend(emitter, notification);
        }
    }

    private void cleanup(final UUID userId, final SseEmitter emitter) {
        connections.computeIfPresent(userId, (key, state) -> {
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

    private void doSend(final SseEmitter emitter, final NotificationDTO notification) {
        try {
            emitter.send(SseEmitter.event().name("notification").data(notification));
        } catch (final IOException e) {
            emitter.completeWithError(e);
        }
    }

    private static final class UserState {
        private final List<SseEmitter> emitters = new ArrayList<>();
        private final List<NotificationDTO> buffer = new ArrayList<>();
        private final ReentrantLock lock = new ReentrantLock();
    }
}
