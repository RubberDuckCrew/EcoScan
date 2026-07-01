package com.rubberduckcrew.ecoscan_backend.notification;

import com.rubberduckcrew.ecoscan_backend.common.SseService;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Slf4j
@RequiredArgsConstructor
@Service
public class NotificationSseService extends SseService<UUID, NotificationSseService.UserState> {
    private static final long SSE_TIMEOUT_MS = 600_000L;
    private static final Duration BUFFER_TTL = Duration.ofDays(7);
    private final NotificationMapper notificationMapper;

    public SseEmitter createEmitter(final UUID userId) {
        final SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);
        final UserState state = store.computeIfAbsent(userId, _ -> new UserState());

        final List<NotificationDTO> pending = withLock(state, () -> {
            state.emitters.add(emitter);
            return List.copyOf(state.buffer);
        });

        emitter.onCompletion(() -> cleanup(userId, emitter));
        emitter.onTimeout(() -> cleanup(userId, emitter));
        emitter.onError(_ -> cleanup(userId, emitter));

        final List<NotificationDTO> sent = new ArrayList<>();
        for (final NotificationDTO notification : pending) {
            if (doSend(emitter, SseEmitter.event().name("notification").data(notification))) {
                sent.add(notification);
            }
        }

        if (!sent.isEmpty()) {
            withLock(state, () -> state.buffer.removeAll(sent));
        }

        log.info("Created SSE emitter for user {}", userId);
        return emitter;
    }

    public void sendNotification(final UUID userId, final Notification notification) {
        final NotificationDTO dto = notificationMapper.toDTO(notification, Instant.now());
        log.info("Sending notification to user {}: {}", userId, dto);
        final UserState state = store.computeIfAbsent(userId, _ -> new UserState());

        final List<SseEmitter> emitters = withLock(state, () -> {
            if (state.emitters.isEmpty()) {
                state.buffer.add(dto);
            }
            return List.copyOf(state.emitters);
        });

        if (emitters.isEmpty()) {
            return;
        }

        boolean anySent = false;
        for (final SseEmitter emitter : emitters) {
            if (doSend(emitter, SseEmitter.event().name("notification").data(dto))) {
                anySent = true;
            }
        }

        if (!anySent) {
            withLock(state, () -> state.buffer.add(dto));
        }
    }

    private void cleanup(final UUID userId, final SseEmitter emitter) {
        store.computeIfPresent(userId, (_, state) -> {
            final boolean empty = withLock(state, () -> {
                state.emitters.remove(emitter);
                return state.emitters.isEmpty() && state.buffer.isEmpty();
            });
            return empty ? null : state;
        });
    }

    @Scheduled(cron = "0 0 * * * *")
    public void evictStaleUsers() {
        final Instant cutoff = Instant.now().minus(BUFFER_TTL);

        store.entrySet().removeIf(entry -> {
            final UUID userId = entry.getKey();
            final UserState state = entry.getValue();

            return withLock(state, () -> {
                if (!state.emitters.isEmpty()) {
                    return false;
                }
                final int before = state.buffer.size();
                state.buffer.removeIf(n -> n.timestamp().isBefore(cutoff));

                if (state.buffer.isEmpty()) {
                    log.info("Removing stale state for offline user {} ({} expired notifications)",
                        userId, before);
                    return true;
                }
                return false;
            });
        });
    }

    protected static final class UserState extends LockableState {
        private final List<SseEmitter> emitters = new ArrayList<>();
        private final List<NotificationDTO> buffer = new ArrayList<>();
    }
}
