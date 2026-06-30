package com.rubberduckcrew.ecoscan_backend.notification;

import com.rubberduckcrew.ecoscan_backend.notification.dto.NotificationDTO;
import com.rubberduckcrew.ecoscan_backend.utils.AuthUtils;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/notification")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationSseService notificationSseService;

    @PostMapping("/send")
    public ResponseEntity<Void> sendNotification(@Valid @RequestBody final NotificationDTO request) {
        final UUID userId = AuthUtils.getSub();
        notificationSseService.sendNotification(userId, request.title(), request.message());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stream")
    public SseEmitter streamNotifications() {
        final UUID userId = AuthUtils.getSub();
        return notificationSseService.createEmitter(userId);
    }
}
