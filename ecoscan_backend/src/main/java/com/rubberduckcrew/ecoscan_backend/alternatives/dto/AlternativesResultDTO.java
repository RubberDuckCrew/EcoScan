package com.rubberduckcrew.ecoscan_backend.alternatives.dto;

import java.util.List;

public record AlternativesResultDTO(List<String> eans) {
    public AlternativesResultDTO {
        eans = eans != null ? List.copyOf(eans) : List.of();
    }
}
