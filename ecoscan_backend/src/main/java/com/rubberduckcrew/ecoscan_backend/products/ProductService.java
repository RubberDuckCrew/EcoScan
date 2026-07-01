package com.rubberduckcrew.ecoscan_backend.products;

import com.rubberduckcrew.ecoscan_backend.food_data.FoodDataRepository;
import com.rubberduckcrew.ecoscan_backend.products.entity.Product;
import com.rubberduckcrew.ecoscan_backend.products.entity.ScannedProduct;
import com.rubberduckcrew.ecoscan_backend.score.dto.GreenScoreResultDTO;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ScannedProductRepository scannedProductRepository;
    private final ProductMapper productMapper;
    private final FoodDataRepository foodDataRepository;
    private final ProductAnalysisService productAnalysisService;

    public Product getProduct(final String id) {
        return productRepository.getProductById(id).orElseGet(() -> getProductFromOpenFoodFacts(id));
    }

    public UUID analyzeProduct(final String id) {
        final Product product = productRepository.getProductById(id).orElseGet(() -> getProductFromOpenFoodFacts(id));
        if (product.getData() == null || product.getData().isEmpty()) {
            try {
                final UUID jobId = productAnalysisService.analyzeProduct(product);
                log.info("Started AI-Analyzer for product with id {} and jobId {}", id, jobId);
                return jobId;
            } catch (Exception e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to start AI-Analyzer for product with id " + id, e);
            }
        } else {
            log.info("Product with id {} already has analysis data, skipping AI-Analyzer", id);
            return null;
        }
    }

    public Product getProductFromOpenFoodFacts(final String id) {
        final Product product = toProduct(foodDataRepository.getProduct(id));
        productRepository.save(product);
        return product;
    }

    public Product toProduct(final Map<String, Object> json) {
        final Product product = new Product();
        //TODO remove leading 0s
        product.setId((String) json.get("code"));
        product.setName((String) json.get("product_name"));
        String categories = (String) json.get("categories");
        if (categories == null || categories.isEmpty()) {
            categories = "";
        }
        product.setCategories(categories);
        product.setDescription(categories);
        //TODO fix dummy values
        product.setImageUrl("");
        product.setData("");
        return product;
    }

    public boolean hasProductBeenScanned(final String id) {
        return scannedProductRepository.existsById(id);
    }

    public ScannedProduct getScannedProduct(final String id) {
        return scannedProductRepository.getScannedProductById(id);
    }

    public void addScannedProduct(final String id, final GreenScoreResultDTO greenScoreResult) {
        final Product product = getProduct(id);
        productRepository.delete(product);
        final ScannedProduct scannedProduct = productMapper.toScannedProduct(product);
        scannedProduct.setScore(greenScoreResult.overallScore());
        scannedProduct.setJustification(greenScoreResult.reason());
        scannedProduct.setScannedDate(LocalDateTime.now());
        scannedProduct.setEnvironmentScore(greenScoreResult.environmentScore());
        scannedProduct.setHealthScore(greenScoreResult.healthScore());
        scannedProduct.setSocialScore(greenScoreResult.socialScore());
        scannedProductRepository.save(scannedProduct);
    }
}
