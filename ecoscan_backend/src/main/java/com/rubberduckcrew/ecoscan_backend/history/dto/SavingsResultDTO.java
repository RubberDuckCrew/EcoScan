package com.rubberduckcrew.ecoscan_backend.history.dto;

import java.math.BigDecimal;

public record SavingsResultDTO(
    BigDecimal co2Saving,
    Integer carRideEquivalent) {
}
