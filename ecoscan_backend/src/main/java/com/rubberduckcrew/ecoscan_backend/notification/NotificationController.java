package com.rubberduckcrew.ecoscan_backend.notification;

import com.rubberduckcrew.ecoscan_backend.utils.AuthUtils;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/notification")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationSseService notificationSseService;

    @GetMapping("/stream")
    public SseEmitter streamNotifications() {
        final UUID userId = AuthUtils.getSub();
        return notificationSseService.createEmitter(userId);
    }
}
