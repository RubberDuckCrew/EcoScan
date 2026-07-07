package com.rubberduckcrew.ecoscan_backend.alternatives;

import com.rubberduckcrew.ecoscan_backend.alternatives.dto.AlternativesJobsDTO;
import com.rubberduckcrew.ecoscan_backend.alternatives.dto.AlternativesRequestDTO;
import com.rubberduckcrew.ecoscan_backend.alternatives.dto.AlternativesResultDTO;
import com.rubberduckcrew.ecoscan_backend.alternatives.dto.NearbyStoreDTO;
import com.rubberduckcrew.ecoscan_backend.common.AiDTO;
import com.rubberduckcrew.ecoscan_backend.food_data.FoodDataRepository;
import com.rubberduckcrew.ecoscan_backend.jobs.JobAlternativeService;
import com.rubberduckcrew.ecoscan_backend.jobs.JobEanService;
import com.rubberduckcrew.ecoscan_backend.jobs.JobSseService;
import com.rubberduckcrew.ecoscan_backend.products.ProductRepository;
import com.rubberduckcrew.ecoscan_backend.products.ProductService;

import java.util.Map;
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

    public AlternativesJobsDTO findAlternatives(final String categories, final String userCoordinates, final UUID userId) {
        final UUID eanJobId = UUID.randomUUID();
        final UUID storeJobId = UUID.randomUUID();
        jobSseService.register(eanJobId, userId);
        jobSseService.register(storeJobId, userId);

        final AiDTO<AlternativesRequestDTO> request = new AiDTO<>(
                eanJobId,
                new AlternativesRequestDTO(categories, userCoordinates, storeJobId.toString())
        );
        rabbitTemplate.convertAndSend("ecoscan.ai.tasks.alternatives", request);
        return new AlternativesJobsDTO(eanJobId, storeJobId);
    }

    @RabbitListener(queuesToDeclare = @Queue("ecoscan.ai.results.alternatives"))
    public void handleAlternativesResult(final AiDTO<AlternativesResultDTO> result) {
        final UUID jobIdAlternatives = result.jobId();
        log.info("Alternatives result for job {}", jobIdAlternatives);
        log.info("EANs: {}", result.data().eans());
        log.info("Stores: {}", result.data().stores());

        log.info("Number of alternatives from agents: {}", result.data().eans().size());

        jobAlternativeService.registerAlternativesJob(jobIdAlternatives, result.data().eans().size());

        final UUID storeJobId = UUID.fromString(result.data().storeJobId());

        result.data().eans().forEach(ean ->
                jobSseService.send(jobIdAlternatives, "product-alternatives-eans", "\"" + ean + "\""));

        result.data().stores().forEach(store ->
                jobSseService.send(storeJobId, "product-alternatives-store", store));

        jobSseService.send(jobIdAlternatives, "product-alternatives-eans", Map.of("value", "DONE"));
        jobSseService.send(storeJobId, "product-alternatives-store", Map.of("done", true));

        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        jobSseService.complete(storeJobId);
        jobSseService.complete(jobIdAlternatives);

//        result.data().alternatives().forEach(ean -> {
//            final String ean = alternative.ean();
//            if (ean == null) {
//                log.warn("Alternative has no EAN, skipping");
                //Wenn alle Alternativen da sind, muss die Verbindung geschlossen werden

//                final boolean completed = jobAlternativeService.incrementAlternativesCounter(jobIdAlternatives);
//                if (completed) {
//                    log.info("Job completed");
//                    jobSseService.complete(jobIdAlternatives);
//                }
//                return;
//            }


            // Produkt wie nach dem Scannen analysieren und Greenscore berechnen

//            try {
//                final UUID owner = jobSseService.getOwner(jobIdAlternatives);
//                final UUID jobIdAnalyzeProduct = productService.analyzeProduct(ean, owner);
//                if (jobIdAnalyzeProduct == null) {
//                    final UUID scoreJobId = scoreService.scoreProduct(ean, owner);
//                    jobEanService.register(scoreJobId, ean);
//                    jobAlternativeService.register(scoreJobId, jobIdAlternatives);
//                }
//                else {
//                    jobAlternativeService.register(jobIdAnalyzeProduct, jobIdAlternatives);
//                }
//            } catch (Exception e) {
//                log.warn("Failed to analyze alternative product with EAN {}, skipping", ean, e);
//                final boolean completed = jobAlternativeService.incrementAlternativesCounter(jobIdAlternatives);
//                if (completed) {
//                    log.info("job completed from catch");
//                    jobSseService.complete(jobIdAlternatives);
//                }
//            }
//        });
//
//        jobSseService.complete(jobIdAlternatives);
//
//        log.info("Result after analyzing product: {}", result.data().alternatives());
    }
}
