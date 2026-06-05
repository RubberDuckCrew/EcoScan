package com.rubberduckcrew.ecoscan_backend.score;

import com.rubberduckcrew.ecoscan_backend.products.ProductService;
import com.rubberduckcrew.ecoscan_backend.products.entity.Product;
import com.rubberduckcrew.ecoscanai.api.GreenScoreApi;
import com.rubberduckcrew.ecoscanai.model.JobResponseGreenScoreResult;
import com.rubberduckcrew.ecoscanai.model.ScoreProductRequest;
import jakarta.validation.ValidationException;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScoreService {

    private final ProductService productService;

    private final GreenScoreApi greenScoreApi;

    public UUID scoreProduct(final String id) {

        final Product product = productService.getProduct(id);
        final ScoreProductRequest scoreProductRequest = new ScoreProductRequest();
        scoreProductRequest.setProductContext(product.getData());
        final Optional<JobResponseGreenScoreResult> jobResponse;

        try {
            jobResponse = Optional.ofNullable(greenScoreApi.scoreProduct(scoreProductRequest));
        } catch (ValidationException e) {
            log.error("OpenAPI client error while scoring product", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to score product", e);
        } catch (RestClientException e) {
            log.error("REST client error while scoring product", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to score product", e);
        }

        return jobResponse.map(JobResponseGreenScoreResult::getJobId).orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                "Failed to score product"));

    }

}
