package com.rubberduckcrew.ecoscan_backend.products.dto;

public record ProductDataDTO(
    String name,
    String description,
    int score,
    int environmentScore,
    int socialScore,
    int healthScore,
    String justification) {
}
