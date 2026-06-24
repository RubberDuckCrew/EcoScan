package com.rubberduckcrew.ecoscan_backend.history.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record SavingsResultDTO(
    UUID jobId,
    BigDecimal co2Saving,
    Integer carRideEquivalent
) {
}
