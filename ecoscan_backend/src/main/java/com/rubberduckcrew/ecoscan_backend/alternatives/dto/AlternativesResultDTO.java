package com.rubberduckcrew.ecoscan_backend.alternatives.dto;

import java.util.List;

//public record AlternativesResultDTO(List<AlternativeProductDTO> alternatives) {
//    public AlternativesResultDTO {
//        alternatives = alternatives != null ? List.copyOf(alternatives) : List.of();
//    }
//}

public record AlternativesResultDTO(List<String> eans, List<NearbyStoreDTO> stores, String storeJobId) {
    public AlternativesResultDTO {
        eans = eans != null ? List.copyOf(eans) : List.of();
        stores = stores != null ? List.copyOf(stores) : List.of();
    }
}