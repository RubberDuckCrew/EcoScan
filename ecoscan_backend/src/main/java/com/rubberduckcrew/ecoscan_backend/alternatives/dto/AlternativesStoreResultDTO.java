package com.rubberduckcrew.ecoscan_backend.alternatives.dto;

import java.util.List;

public record AlternativesStoreResultDTO(List<NearbyStoreDTO> stores) {
    public AlternativesStoreResultDTO {
        stores = stores != null ? List.copyOf(stores) : List.of();
    }
}
