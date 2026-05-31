package com.rubberduckcrew.ecoscan_backend.score;

import static org.springframework.http.HttpStatus.NOT_FOUND;

import com.rubberduckcrew.ecoscan_backend.products.ProductRepository;
import com.rubberduckcrew.ecoscan_backend.products.entity.Product;
import com.rubberduckcrew.ecoscanai.api.GreenScoreApi;
import com.rubberduckcrew.ecoscanai.model.JobResponseGreenScoreResult;
import com.rubberduckcrew.ecoscanai.model.ScoreProductRequest;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ScoreService {

    private final ProductRepository productRepository;

    private final GreenScoreApi greenScoreApi;

    public UUID scoreProduct(final String id) {

        final Product product = productRepository.findById(id).orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Product not found"));
        final ScoreProductRequest scoreProductRequest = new ScoreProductRequest();
        scoreProductRequest.setProductContext(product.getDescription());
        final Optional<JobResponseGreenScoreResult> jobResponse;

        try {
            jobResponse = Optional.of(greenScoreApi.scoreProduct(scoreProductRequest));
        } catch (ResponseStatusException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to score product", e);
        }

        return jobResponse.map(JobResponseGreenScoreResult::getJobId).orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                "Failed to score product"));

    }

}
