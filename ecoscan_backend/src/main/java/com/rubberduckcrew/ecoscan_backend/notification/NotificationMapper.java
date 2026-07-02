package com.rubberduckcrew.ecoscan_backend.notification;

import java.time.Instant;
import org.mapstruct.Mapper;

@Mapper
public interface NotificationMapper {
    NotificationDTO toDTO(Notification notification, Instant timestamp);
}
