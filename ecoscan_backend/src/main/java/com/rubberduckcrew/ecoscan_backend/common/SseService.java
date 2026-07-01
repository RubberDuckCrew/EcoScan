package com.rubberduckcrew.ecoscan_backend.common;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;
import java.util.function.Supplier;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

public class SseService<K, S extends SseService.LockableState> {
    protected final Map<K, S> store = new ConcurrentHashMap<>();

    protected <T> T withLock(final S state, final Supplier<T> action) {
        state.lock.lock();
        try {
            return action.get();
        } finally {
            state.lock.unlock();
        }
    }

    protected boolean doSend(final SseEmitter emitter, final SseEmitter.SseEventBuilder event) {
        try {
            emitter.send(event);
            return true;
        } catch (final IOException e) {
            emitter.completeWithError(e);
            return false;
        }
    }

    protected static class LockableState {
        /* default */ final ReentrantLock lock = new ReentrantLock();
    }
}
