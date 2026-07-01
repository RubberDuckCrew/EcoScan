package com.rubberduckcrew.ecoscan_backend.history;

import com.rubberduckcrew.ecoscan_backend.common.AiDTO;
import com.rubberduckcrew.ecoscan_backend.history.dto.SavingsRequestDTO;
import com.rubberduckcrew.ecoscan_backend.history.dto.SavingsResultDTO;
import com.rubberduckcrew.ecoscan_backend.history.entity.ScanHistory;
import com.rubberduckcrew.ecoscan_backend.jobs.JobUserService;
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
    private final HistoryService historyService;
    private final SavingsRepository savingsRepository;
    private final ProductMapper productMapper;
    private final SavingsMapper savingsMapper;
    private final RabbitTemplate rabbitTemplate;
    private final SseService sseService;
    private final JobUserService jobUserService;

    public UUID getSavings(final UUID userId) {
        log.info("Getting savings for user {}", userId);
        if (savingsRepository.existsById(userId)) {
            log.info("Savings already calculated for user {}", userId);
            final UUID jobId = UUID.randomUUID();
            sendSavingsResponse(jobId, savingsMapper.toDTO(savingsRepository.findById(userId).orElseThrow()));
            return jobId;
        }
        return calculateSavings(userId, historyService.getWeekHistory(userId));
    }

    @RabbitListener(queuesToDeclare = @Queue("ecoscan.ai.results.savings"))
    public void handleSavingsResult(final AiDTO<SavingsResultDTO> result) {
        log.info("Received savings results: {}", result);
        final UUID userId = jobUserService.getUserId(result.jobId()).orElseThrow();
        savingsRepository.save(savingsMapper.toEntity(result.data(), userId));
        sendSavingsResponse(result.jobId(), result.data());
        jobUserService.remove(result.jobId());
    }

    private UUID calculateSavings(final UUID userId, final List<ScanHistory> weekHistory) {
        log.info("Calculating savings for user {}", userId);
        final List<ProductDataDTO> history = weekHistory.stream()
            .map(ScanHistory::getProduct)
            .map(productMapper::toDataDTO)
            .toList();

        final AiDTO<SavingsRequestDTO> request = new AiDTO<>(
            UUID.randomUUID(),
            new SavingsRequestDTO(history.toString()));
        jobUserService.register(request.jobId(), userId);
        rabbitTemplate.convertAndSend(
            "ecoscan.ai.tasks.savings",
            request);

        return request.jobId();
    }

    private void sendSavingsResponse(final UUID jobId, final SavingsResultDTO result) {
        log.info("Sending savings response for job {}: {}", jobId, result);
        sseService.send(jobId, "savings-evaluation", result);
        sseService.complete(jobId);
    }
}
