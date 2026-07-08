package com.rubberduckcrew.ecoscan_backend.alternatives;

import com.rubberduckcrew.ecoscan_backend.alternatives.dto.AlternativesJobsDTO;
import com.rubberduckcrew.ecoscan_backend.alternatives.dto.AlternativesRequestDTO;
import com.rubberduckcrew.ecoscan_backend.alternatives.dto.AlternativesResultDTO;
import com.rubberduckcrew.ecoscan_backend.alternatives.dto.AlternativesStoreRequestDTO;
import com.rubberduckcrew.ecoscan_backend.alternatives.dto.AlternativesStoreResultDTO;
import com.rubberduckcrew.ecoscan_backend.common.AiDTO;
import com.rubberduckcrew.ecoscan_backend.food_data.FoodDataRepository;
import com.rubberduckcrew.ecoscan_backend.jobs.JobAlternativeService;
import com.rubberduckcrew.ecoscan_backend.jobs.JobEanService;
import com.rubberduckcrew.ecoscan_backend.jobs.JobSseService;
import com.rubberduckcrew.ecoscan_backend.products.ProductRepository;
import com.rubberduckcrew.ecoscan_backend.products.ProductService;
import com.rubberduckcrew.ecoscan_backend.products.entity.Product;
import com.rubberduckcrew.ecoscan_backend.score.ScoreService;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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

        final AiDTO<AlternativesRequestDTO> alternativesRequest = new AiDTO<>(
            eanJobId,
            new AlternativesRequestDTO(categories));
        rabbitTemplate.convertAndSend("ecoscan.ai.tasks.alternatives", alternativesRequest);

        final AiDTO<AlternativesStoreRequestDTO> storesRequest = new AiDTO<>(
            storeJobId,
            new AlternativesStoreRequestDTO(userCoordinates));
        rabbitTemplate.convertAndSend("ecoscan.ai.tasks.alternatives.stores", storesRequest);

        return new AlternativesJobsDTO(eanJobId, storeJobId);
    }

    @RabbitListener(queuesToDeclare = @Queue("ecoscan.ai.results.alternatives"))
    public void handleAlternativesResult(final AiDTO<AlternativesResultDTO> result) {
        final UUID jobIdAlternatives = result.jobId();
        log.info("Alternatives result for job {}", jobIdAlternatives);
        log.info("EAN result received for job {}", jobIdAlternatives);
        jobAlternativeService.registerAlternativesJob(jobIdAlternatives, result.data().eans().size());

        result.data().eans().forEach(ean -> {
            try {
                Product product = foodDataRepository.getProduct(ean);

                Map<String, Object> payload = Map.of(
                    "ean", ean,
                    "name", product.getName() != null ? product.getName() : "Name nicht gefunden",
                    "imageUrl", product.getImageUrl() != null ? product.getImageUrl() : "");
                jobSseService.send(jobIdAlternatives, "product-alternatives-eans", payload);

            } catch (ResponseStatusException e) {
                log.warn("Product not found for EAN {}, not sending to frontend", ean);
            }
        });

        jobSseService.send(jobIdAlternatives, "product-alternatives-eans", Map.of("value", "DONE"));
        jobSseService.complete(jobIdAlternatives);
    }

    @RabbitListener(queuesToDeclare = @Queue("ecoscan.ai.results.alternatives.stores"))
    public void handleStoreResult(final AiDTO<AlternativesStoreResultDTO> result) {
        final UUID storeJobId = result.jobId();
        log.info("Store result received for job {}", storeJobId);

        result.data().stores().forEach(store -> jobSseService.send(storeJobId, "product-alternatives-stores", store));

        jobSseService.send(storeJobId, "product-alternatives-stores", Map.of("done", true));
        jobSseService.complete(storeJobId);
    }

    //    @RabbitListener(queuesToDeclare = @Queue("ecoscan.ai.results.alternatives"))
    //    public void handleAlternativesResult(final AiDTO<AlternativesResultDTO> result) {
    //        final UUID jobIdAlternatives = result.jobId();
    //        log.info("Alternatives result for job {}", jobIdAlternatives);
    //        log.info("EANs: {}", result.data().eans());
    //        log.info("Stores: {}", result.data().stores());
    //
    //        log.info("Number of alternatives from agents: {}", result.data().eans().size());
    //
    //        jobAlternativeService.registerAlternativesJob(jobIdAlternatives, result.data().eans().size());
    //
    //        final UUID storeJobId = UUID.fromString(result.data().storeJobId());
    //
    //        result.data().eans().forEach(ean -> jobSseService.send(jobIdAlternatives, "product-alternatives-eans", "\"" + ean + "\""));
    //
    //        result.data().stores().forEach(store -> jobSseService.send(storeJobId, "product-alternatives-store", store));
    //
    //        jobSseService.send(jobIdAlternatives, "product-alternatives-eans", Map.of("value", "DONE"));
    //        jobSseService.send(storeJobId, "product-alternatives-store", Map.of("done", true));
    //
    //        jobSseService.complete(storeJobId);
    //        jobSseService.complete(jobIdAlternatives);

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
    //}
}
