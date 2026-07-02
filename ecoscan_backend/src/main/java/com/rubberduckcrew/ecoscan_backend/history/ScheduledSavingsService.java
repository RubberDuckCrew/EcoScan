package com.rubberduckcrew.ecoscan_backend.history;

import com.rubberduckcrew.ecoscan_backend.jobs.JobUserService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduledSavingsService {
    private final SavingsService savingsService;
    private final HistoryService historyService;
    private final JobUserService jobUserService;

    @Scheduled(cron = "${ecoscan.savings.cron:0 0 4 * * SUN}")
    public void calculateSavingsForActiveUsers() {
        final List<UUID> activeUsers = historyService.getActiveUsers();
        log.info("Running scheduled savings job for {} active users", activeUsers.size());
        activeUsers.forEach(userId -> {
            try {
                final UUID jobId = jobUserService.register(userId);
                savingsService.calculateSavings(jobId, userId);
            } catch (Exception e) {
                log.error("Error calculating savings for user {}: {}", userId, e.getMessage());
            }
        });
    }
}
