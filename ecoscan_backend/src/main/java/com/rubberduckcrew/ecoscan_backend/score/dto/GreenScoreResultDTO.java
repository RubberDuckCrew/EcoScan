package com.rubberduckcrew.ecoscan_backend.score.dto;

public record GreenScoreResultDTO(
    Integer overallScore,
    Integer healthScore,
    Integer environmentScore,
    Integer socialScore,
    String reason) {

}
