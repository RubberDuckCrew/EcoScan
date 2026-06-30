package com.rubberduckcrew.ecoscan_backend.notification.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

public record NotificationDTO(
    @NotBlank String title,
    @NotBlank String message,
    Instant timestamp) {

}
