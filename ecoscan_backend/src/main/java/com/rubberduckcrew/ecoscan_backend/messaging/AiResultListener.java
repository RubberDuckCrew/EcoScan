package com.rubberduckcrew.ecoscan_backend.messaging;

import com.rubberduckcrew.ecoscanai.model.JobResponseStr;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class AiResultListener {

    private final MessagingService messagingService;

    @RabbitListener(queues = "ai_results")
    public void handleResult(@Payload final JobResponseStr msg) {
        log.info("Job {} finished with status {}", msg.getJobId(), msg.getStatus());
        switch (msg.getEndpoint()) {
        case "/test":
            messagingService.receivedTest(msg);
            break;
        default:
            log.warn("Received message for unknown endpoint: {}", msg.getEndpoint());
        }
    }
}
