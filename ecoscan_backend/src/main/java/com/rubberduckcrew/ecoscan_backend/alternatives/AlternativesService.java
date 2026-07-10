package com.rubberduckcrew.ecoscan_backend.alternatives;

import com.rubberduckcrew.ecoscan_backend.alternatives.dto.AlternativeDTO;
import com.rubberduckcrew.ecoscan_backend.alternatives.dto.AlternativesJobsDTO;
import com.rubberduckcrew.ecoscan_backend.alternatives.dto.AlternativesRequestDTO;
import com.rubberduckcrew.ecoscan_backend.alternatives.dto.AlternativesResultDTO;
import com.rubberduckcrew.ecoscan_backend.alternatives.dto.AlternativesStoreRequestDTO;
import com.rubberduckcrew.ecoscan_backend.alternatives.dto.AlternativesStoreResultDTO;
import com.rubberduckcrew.ecoscan_backend.alternatives.dto.NearbyStoreDTO;
import com.rubberduckcrew.ecoscan_backend.common.AiDTO;
import com.rubberduckcrew.ecoscan_backend.food_data.FoodDataRepository;
import com.rubberduckcrew.ecoscan_backend.jobs.JobSseService;
import com.rubberduckcrew.ecoscan_backend.products.entity.Product;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;
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
    private final RabbitTemplate rabbitTemplate;
    private final JobSseService jobSseService;
    private final FoodDataRepository foodDataRepository;

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

        final Set<String> uniqueEans = new HashSet<>(result.data().eans());

        uniqueEans.forEach(ean -> {
            try {
                final Product product = foodDataRepository.getProduct(ean);
                final AlternativeDTO alternative = new AlternativeDTO(
                    ean,
                    product.getName() != null ? product.getName() : "Name nicht gefunden",
                    product.getImageUrl() != null ? product.getImageUrl() : ""
                );
                jobSseService.send(jobIdAlternatives, "product-alternatives-eans", alternative);

            } catch (ResponseStatusException e) {
                log.warn("Product not found for EAN {}, not sending to frontend", ean);
            }
        });

        jobSseService.send(jobIdAlternatives, "product-alternatives-eans", new AlternativeDTO("DONE", "", ""));
        jobSseService.complete(jobIdAlternatives);
    }

    @RabbitListener(queuesToDeclare = @Queue("ecoscan.ai.results.alternatives.stores"))
    public void handleStoreResult(final AiDTO<AlternativesStoreResultDTO> result) {
        final UUID storeJobId = result.jobId();
        log.info("Store result received for job {}", storeJobId);

        final Set<String> sentStores = new HashSet<>();
        result.data().stores().forEach(store -> {
            final String key = store.name() + "-" + store.latitude() + "-" + store.longitude();
            if (sentStores.add(key)) {
                jobSseService.send(storeJobId, "product-alternatives-stores", store);
            }
        });
        final NearbyStoreDTO doneMessage = new NearbyStoreDTO("DONE", 0.0, 0.0);

        jobSseService.send(storeJobId, "product-alternatives-stores", doneMessage);
        jobSseService.complete(storeJobId);
    }
}
