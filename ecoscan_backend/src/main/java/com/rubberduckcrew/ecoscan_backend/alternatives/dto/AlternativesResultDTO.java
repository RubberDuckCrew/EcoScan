package com.rubberduckcrew.ecoscan_backend.alternatives.dto;

import java.util.List;

public record AlternativesResultDTO(List<AlternativeProductDTO> alternatives) {
    public AlternativesResultDTO {
        alternatives = alternatives != null ? List.copyOf(alternatives) : List.of();
    }
}
