package com.rubberduckcrew.ecoscan_backend.history.dto;

import java.util.UUID;

public record SavingsRequestDTO(
    UUID jobId,
    String savingsContext
) {
}
