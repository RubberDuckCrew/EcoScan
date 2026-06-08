package com.rubberduckcrew.ecoscan_backend.messaging;

import com.rubberduckcrew.ecoscan_backend.jobs.JobService;
import com.rubberduckcrew.ecoscanai.model.JobResponseGreenScoreResult;
import com.rubberduckcrew.ecoscanai.model.JobResponseSavingsResult;
import com.rubberduckcrew.ecoscanai.model.JobResponseStr;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessagingService {

    private final JobService jobService;

    public void receivedTest(@Payload final JobResponseStr msg) {
        log.info("Received test");
    }

    public void receivedScore(@Payload final JobResponseGreenScoreResult msg) {
        final UUID jobId = msg.getJobId();
        if (msg.getResult() == null) {
            log.error("Job result from {} is null", jobId);
            return;
        }
        final Integer score = msg.getResult().getOverallScore();
        if (score == null) {
            log.error("Job result from {} has null overallScore", jobId);
            return;
        }
        log.info("Job ID: {}, Score: {}", jobId, score);
        jobService.sendProductEvaluation(jobId, msg.getResult());
    }

    public void receivedSavings(@Payload final JobResponseSavingsResult msg) {
        final UUID jobId = msg.getJobId();
        if (msg.getResult() == null) {
            log.error("Savings job result from {} is null", jobId);
            return;
        }
        log.info("Savings job with id {} resulted in: {}", jobId, msg.getResult());
        jobService.sendSavingsEvaluation(jobId, msg.getResult());
    }
}
