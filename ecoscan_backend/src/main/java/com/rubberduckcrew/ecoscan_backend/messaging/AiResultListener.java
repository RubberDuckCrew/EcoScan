package com.rubberduckcrew.ecoscan_backend.messaging;

import com.rubberduckcrew.ecoscanai.model.JobResponseGreenScoreResult;
import com.rubberduckcrew.ecoscanai.model.JobResponseStr;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Component
@Slf4j
@RequiredArgsConstructor
public class AiResultListener {

    private final ObjectMapper objectMapper;
    private final MessagingService messagingService;

    @RabbitListener(queues = "ai_results")
    public void handleResult(@Payload final Message message) {
        final JsonNode node = objectMapper.readTree(message.getBody());
        final String endpoint = node.path("endpoint").asString();
        switch (endpoint) {
        case "/test" -> {
            final JobResponseStr job = objectMapper.treeToValue(node, JobResponseStr.class);
            messagingService.receivedTest(job);
        }
        case "/score" -> {
            final JobResponseGreenScoreResult job = objectMapper.treeToValue(node, JobResponseGreenScoreResult.class);
            messagingService.receivedScore(job);
        }
        default -> log.warn("Received message for unknown endpoint: {}", endpoint);
        }
    }
}
