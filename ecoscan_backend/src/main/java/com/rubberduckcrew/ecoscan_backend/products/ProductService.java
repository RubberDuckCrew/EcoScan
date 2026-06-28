package com.rubberduckcrew.ecoscan_backend.products;

import com.rubberduckcrew.ecoscan_backend.food_data.FoodDataRepository;
import com.rubberduckcrew.ecoscan_backend.products.entity.Product;
import com.rubberduckcrew.ecoscan_backend.products.entity.ScannedProduct;
import com.rubberduckcrew.ecoscan_backend.score.dto.GreenScoreResultDTO;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;import lombok.extern.slf4j.Slf4j;



import lombok.RequiredArgsConstructor;
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
        final Product product = productRepository.getProductById(id).orElseGet(() -> getProductFromOpenFoodFacts(id));
        if (product.getData() == null) {
            try {
				final UUID jobId = productAnalysisService.analyzeProduct(product);
				log.info("Started AI-Analyzer for product with id {} and jobId {}", id, jobId);
            } catch (Exception e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to start AI-Analyzer for product with id " + id, e);
            }
        }
        return product;
    }

    public Product getProductFromOpenFoodFacts(final String id) {
        return toProduct(foodDataRepository.getProduct(id));
    }

    public Product toProduct(final Map<String, Object> json) {
        final Product product = new Product();
        //TODO remove leading 0s
        product.setId((String) json.get("code"));
        product.setName((String) json.get("product_name"));
        product.setCategories((String) json.get("categories"));
		product.setDescription((String) json.get("categories"));
        //product.setImageUrl((String) json.get("imageUrl"));
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
