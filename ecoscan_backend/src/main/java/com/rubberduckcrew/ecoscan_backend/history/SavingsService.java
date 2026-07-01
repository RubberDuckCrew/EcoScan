package com.rubberduckcrew.ecoscan_backend.history;

import com.rubberduckcrew.ecoscan_backend.common.AiDTO;
import com.rubberduckcrew.ecoscan_backend.history.dto.SavingsRequestDTO;
import com.rubberduckcrew.ecoscan_backend.history.dto.SavingsResultDTO;
import com.rubberduckcrew.ecoscan_backend.history.entity.ScanHistory;
import com.rubberduckcrew.ecoscan_backend.jobs.JobUserService;
import com.rubberduckcrew.ecoscan_backend.jobs.SseService;
import com.rubberduckcrew.ecoscan_backend.notification.Notification;
import com.rubberduckcrew.ecoscan_backend.notification.NotificationSseService;
import com.rubberduckcrew.ecoscan_backend.products.ProductMapper;
import com.rubberduckcrew.ecoscan_backend.products.dto.ProductDataDTO;
import java.util.List;
import java.util.Optional;
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
    private final NotificationSseService notificationSseService;

    public UUID getSavings(final UUID userId) {
        log.info("Getting savings for user {}", userId);
        final Optional<UUID> existingJob = jobUserService.getJobId(userId);
        if (existingJob.isPresent()) {
            log.info("Existing job found for user {}: {}", userId, existingJob.get());
            return existingJob.get();
        }
        final UUID jobId = jobUserService.register(userId);
        return savingsRepository.findById(userId)
            .map(savings -> {
                log.info("Savings already calculated for user {}", userId);
                sendSavingsResponse(jobId, savingsMapper.toDTO(savings));
                return jobId;
            })
            .orElseGet(() -> calculateSavings(jobId, historyService.getWeekHistory(userId)));
    }

    @RabbitListener(queuesToDeclare = @Queue("ecoscan.ai.results.savings"))
    public void handleSavingsResult(final AiDTO<SavingsResultDTO> result) {
        log.info("Received savings results: {}", result);
        final Optional<UUID> userId = jobUserService.getUserId(result.jobId());
        if (userId.isEmpty()) {
            log.warn("Received AI result for job {}, but the job has already expired or does not exist.", result.jobId());
            return;
        }
        savingsRepository.save(savingsMapper.toEntity(result.data(), userId.get()));
        sendSavingsResponse(result.jobId(), result.data());
        notificationSseService.sendNotification(
            userId.get(),
            Notification.builder()
                .title("Dein Wochen-Ergebnis \uD83C\uDF3F")
                .message(String.format("Du hast diese Woche %,.1f kg CO₂ eingespart! Sieh dir jetzt deine gesamte Statistik an.", result.data().co2Saving()))
                .url("/History")
                .build());
    }

    private UUID calculateSavings(final UUID jobId, final List<ScanHistory> weekHistory) {
        log.info("Calculating savings for job {}", jobId);
        final List<ProductDataDTO> history = weekHistory.stream()
            .map(ScanHistory::getProduct)
            .map(productMapper::toDataDTO)
            .toList();

        final AiDTO<SavingsRequestDTO> request = new AiDTO<>(
            jobId,
            new SavingsRequestDTO(history.toString()));
        rabbitTemplate.convertAndSend(
            "ecoscan.ai.tasks.savings",
            request);

        return request.jobId();
    }

    private void sendSavingsResponse(final UUID jobId, final SavingsResultDTO result) {
        log.info("Sending savings response for job {}: {}", jobId, result);
        sseService.send(jobId, "savings-evaluation", result);
        sseService.complete(jobId);
        jobUserService.remove(jobId);
    }
}
