package com.rubberduckcrew.ecoscan_backend.common;

import java.util.UUID;

public record AiDTO<T>(
    UUID jobId,
    UUID userId,
    T data) {
}
