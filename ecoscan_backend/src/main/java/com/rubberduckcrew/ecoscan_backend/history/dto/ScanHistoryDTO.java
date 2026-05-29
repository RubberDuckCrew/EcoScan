package com.rubberduckcrew.ecoscan_backend.history.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.util.UUID;

public record ScanHistoryDTO(
                             UUID id,
                             String productId,
                             String name,
                             String imageUrl,
                             int score,

                             @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime savedDate) {
}
