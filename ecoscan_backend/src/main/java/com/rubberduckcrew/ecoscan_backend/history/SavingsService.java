package com.rubberduckcrew.ecoscan_backend.history;

import com.rubberduckcrew.ecoscan_backend.common.AiDTO;
import com.rubberduckcrew.ecoscan_backend.history.dto.SavingsRequestDTO;
import com.rubberduckcrew.ecoscan_backend.history.dto.SavingsResultDTO;
import com.rubberduckcrew.ecoscan_backend.history.entity.ScanHistory;
import com.rubberduckcrew.ecoscan_backend.jobs.SseService;
import com.rubberduckcrew.ecoscan_backend.products.ProductMapper;
import com.rubberduckcrew.ecoscan_backend.products.dto.ProductDataDTO;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class SavingsService {
    private final ProductMapper productMapper;
    private final RabbitTemplate rabbitTemplate;
    private final SseService sseService;

    public UUID calculateSavings(final UUID userId, final List<ScanHistory> weekHistory) {
        log.info("Calculating savings for user {}", userId);
        final List<ProductDataDTO> history = weekHistory.stream()
            .map(ScanHistory::getProduct)
            .map(productMapper::toDataDTO)
            .toList();

        final AiDTO<SavingsRequestDTO> request = new AiDTO<>(
            UUID.randomUUID(),
            new SavingsRequestDTO(history.toString())
        );
        rabbitTemplate.convertAndSend(
            "ecoscan.ai.tasks.savings",
            request
        );

        return request.jobId();
    }

    @RabbitListener(queuesToDeclare = @Queue("ecoscan.ai.results.savings"))
    public void handleSavingsResult(final AiDTO<SavingsResultDTO> result) {
        log.info("Received savings results: {}", result.data());
        sseService.send(result.jobId(), "savings-evaluation", result.data());
        sseService.complete(result.jobId());
    }
}
