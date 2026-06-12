package com.rubberduckcrew.ecoscan_backend.products.dto;

public record ProductDataDTO(
    String id,
    String name,
    String description,
    String imageUrl,
    int score,
    int environmentScore,
    int socialScore,
    int healthScore,
    String justification) implements ProductResponse {
}
