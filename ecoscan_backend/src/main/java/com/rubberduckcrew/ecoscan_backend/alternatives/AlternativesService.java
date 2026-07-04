package com.rubberduckcrew.ecoscan_backend.alternatives;

import com.rubberduckcrew.ecoscan_backend.alternatives.dto.AlternativesRequestDTO;
import com.rubberduckcrew.ecoscan_backend.alternatives.dto.AlternativesResultDTO;
import com.rubberduckcrew.ecoscan_backend.common.AiDTO;
import com.rubberduckcrew.ecoscan_backend.food_data.FoodDataRepository;
import com.rubberduckcrew.ecoscan_backend.jobs.JobAlternativeService;
import com.rubberduckcrew.ecoscan_backend.jobs.JobEanService;
import com.rubberduckcrew.ecoscan_backend.jobs.JobSseService;
import com.rubberduckcrew.ecoscan_backend.products.ProductRepository;
import com.rubberduckcrew.ecoscan_backend.products.ProductService;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

import com.rubberduckcrew.ecoscan_backend.products.entity.Product;
import com.rubberduckcrew.ecoscan_backend.score.ScoreService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlternativesService {
    private final ProductService productService;
    private final JobEanService jobEanService;
    private final JobAlternativeService jobAlternativeService;
    private final RabbitTemplate rabbitTemplate;
    private final JobSseService jobSseService;
    private final FoodDataRepository foodDataRepository;
    private final ProductRepository productRepository;
    private final ScoreService scoreService;

    public UUID findAlternatives(final String categories, final String userCoordinates, final UUID userId) {
        log.info("findAlternatives");

        final UUID jobId = UUID.randomUUID();
        jobSseService.register(jobId,userId);
        log.info("Registered job {} for user {}", jobId, userId);

        final AiDTO<AlternativesRequestDTO> request = new AiDTO<>(
            jobId,
            new AlternativesRequestDTO(categories, userCoordinates));

        rabbitTemplate.convertAndSend("ecoscan.ai.tasks.alternatives", request);
        return jobId;
    }

    @RabbitListener(queuesToDeclare = @Queue("ecoscan.ai.results.alternatives"))
    public void handleAlternativesResult(final AiDTO<AlternativesResultDTO> result) {
        final UUID jobIdAlternatives = result.jobId();
        log.info("Alternatives result for job {}", jobIdAlternatives);

        jobAlternativeService.registerAlternativesJob(jobIdAlternatives, result.data().alternatives().size());

        result.data().alternatives().forEach(alternative -> {
            final String ean = alternative.ean();
            if (ean == null) {
                log.warn("Alternative has no EAN, skipping");
                final boolean completed = jobAlternativeService.incrementAlternativesCounter(jobIdAlternatives);
                if (completed) {
                    jobSseService.complete(jobIdAlternatives);
                }
                return;
            }
            try {
                final UUID owner = jobSseService.getOwner(jobIdAlternatives);
                final UUID jobIdAnalyzeProduct = productService.analyzeProduct(ean, owner);
                if (jobIdAnalyzeProduct == null) {
                    final UUID scoreJobId = scoreService.scoreProduct(ean, owner);
                    jobEanService.register(scoreJobId, ean);
                    jobAlternativeService.register(scoreJobId, jobIdAlternatives);
                }
                else {
                    jobAlternativeService.register(jobIdAnalyzeProduct, jobIdAlternatives);
                }
            } catch (Exception e) {
                log.warn("Failed to analyze alternative product with EAN {}, skipping", ean, e);
                final boolean completed = jobAlternativeService.incrementAlternativesCounter(jobIdAlternatives);
                if (completed) {
                    jobSseService.complete(jobIdAlternatives);
                }
            }
        });

        log.info("Result after analyzing product: {}", result.data().alternatives());
    }
}
