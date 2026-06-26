package com.rubberduckcrew.ecoscan_backend.products;

import com.rubberduckcrew.ecoscan_backend.food_data.FoodDataRepository;
import com.rubberduckcrew.ecoscan_backend.products.entity.Product;
import com.rubberduckcrew.ecoscan_backend.products.entity.ScannedProduct;
import com.rubberduckcrew.ecoscanai.model.GreenScoreResult;
import java.time.LocalDateTime;
import java.util.Map;
import com.rubberduckcrew.ecoscanai.api.ProductAnalysisApi;
import com.rubberduckcrew.ecoscanai.model.ProductAnalysisRequest;
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
    private final ProductAnalysisApi productAnalysisApi;

    public Product getProduct(final String id) {
        final Product product = productRepository.getProductById(id).orElseGet(() -> {
            //TODO get from openfoodfacts database; for now use dummy
            final Product p = new Product();
            p.setId(id);
            p.setName("Product " + id);
            p.setDescription("Description for product " + id);
			p.setImageUrl("");
            return p;
        });
        if (product.getData() == null) {
            try {
                final ProductAnalysisRequest req = new ProductAnalysisRequest()
                    .productId(product.getId())
                    .productName(product.getName())
                    .productDescription(product.getDescription());
                productAnalysisApi.analyzeProduct(req);
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

    public void updateProductData(final String id, final String data) {
        final Product p = getProduct(id);
        p.setData(data);
        productRepository.save(p);
    }
}
