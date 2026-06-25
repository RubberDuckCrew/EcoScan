package com.rubberduckcrew.ecoscan_backend.messaging;

import com.rubberduckcrew.ecoscanai.model.JobResponseGreenScoreResult;
import com.rubberduckcrew.ecoscanai.model.JobResponseSavingsResult;
import com.rubberduckcrew.ecoscanai.model.JobResponseStr;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
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
    private final RabbitTemplate rabbitTemplate;

    @RabbitListener(queuesToDeclare = @Queue("ai_results"))
    public void handleResult(@Payload final Message message) {
        try {
            final JsonNode node = objectMapper.readTree(message.getBody());
            final String endpoint = node.path("endpoint").asString();

            switch (endpoint) {
            case "/test" -> {
                try {
                    final JobResponseStr job = objectMapper.treeToValue(node, JobResponseStr.class);
                    messagingService.receivedTest(job);
                } catch (Exception e) {
                    log.error("Failed to deserialize JobResponseStr from message", e);
                    routeToDlq(message, "deserialization_error", e);
                }
            }
            case "/score" -> {
                try {
                    final JobResponseGreenScoreResult job = objectMapper.treeToValue(node, JobResponseGreenScoreResult.class);
                    messagingService.receivedScore(job);
                } catch (Exception e) {
                    log.error("Failed to deserialize JobResponseGreenScoreResult from message", e);
                    routeToDlq(message, "deserialization_error", e);
                }
            }
            case "/savings" -> {
                try {
                    final JobResponseSavingsResult job = objectMapper.treeToValue(node, JobResponseSavingsResult.class);
                    messagingService.receivedSavings(job);
                } catch (Exception e) {
                    log.error("Failed to deserialize JobResponseSavingsResult from message", e);
                    routeToDlq(message, "deserialization_error", e);
                }
            }
            default -> {
                log.warn("Received message for unknown endpoint: {}", endpoint);
            }
            }
        } catch (Exception e) {
            log.error("Failed to parse message body as JSON", e);
            routeToDlq(message, "parse_error", e);
        }
    }

    private void routeToDlq(final Message message, final String errorType, final Exception exception) {
        try {
            message.getMessageProperties().getHeaders().put("x-error-type", errorType);
            message.getMessageProperties().getHeaders().put("x-error-message", exception.getMessage());
            rabbitTemplate.convertAndSend("ai_results_dlx", "ai_results", message);
            log.info("Message routed to DLQ due to {}: {}", errorType, exception.getMessage());
        } catch (Exception dlqException) {
            log.error("Failed to route message to DLQ", dlqException);
        }
    }
}
