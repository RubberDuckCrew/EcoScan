package com.rubberduckcrew.ecoscan_backend.products;

import com.rubberduckcrew.ecoscan_backend.food_data.FoodDataRepository;
import com.rubberduckcrew.ecoscan_backend.products.entity.Product;
import com.rubberduckcrew.ecoscan_backend.products.entity.ScannedProduct;
import com.rubberduckcrew.ecoscanai.model.GreenScoreResult;
import java.time.LocalDateTime;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ScannedProductRepository scannedProductRepository;
    private final ProductMapper productMapper;
    private final FoodDataRepository foodDataRepository;

    public Product getProduct(final String id) {
        return productRepository.getProductById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
            "Product with id " + id + " not found"));
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
        //product.setImageUrl((String) json.get("imageUrl"));
        return product;
    }

    public boolean hasProductBeenScanned(final String id) {
        return scannedProductRepository.existsById(id);
    }

    public ScannedProduct getScannedProduct(final String id) {
        return scannedProductRepository.getScannedProductById(id);
    }

    public void addScannedProduct(final String id, final GreenScoreResult greenScoreResult) {
        final Product product = getProduct(id);
        productRepository.delete(product);
        final ScannedProduct scannedProduct = productMapper.toScannedProduct(product);
        scannedProduct.setScore(greenScoreResult.getOverallScore());
        scannedProduct.setJustification(greenScoreResult.getReason());
        scannedProduct.setScannedDate(LocalDateTime.now());
        scannedProduct.setEnvironmentScore(greenScoreResult.getEnvironmentScore());
        scannedProduct.setHealthScore(greenScoreResult.getHealthScore());
        scannedProduct.setSocialScore(greenScoreResult.getSocialScore());
        scannedProductRepository.save(scannedProduct);
    }

}
