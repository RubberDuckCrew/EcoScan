package com.rubberduckcrew.ecoscan_backend.notification;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class Notification {
    private final String title;
    private final String message;
    private final String url;
}