package com.rubberduckcrew.ecoscan_backend.products.dto;

public record ProductAnalysisRequestDTO(
    String productName,
    String productCategories,
    String productId) {
}
