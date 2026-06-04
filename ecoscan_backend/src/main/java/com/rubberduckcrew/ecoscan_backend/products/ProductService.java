package com.rubberduckcrew.ecoscan_backend.products;

import com.rubberduckcrew.ecoscan_backend.products.entity.Product;
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
    private final ProductAnalysisApi productAnalysisApi;

    public Product getProduct(final String id) {
        final Product product = productRepository.getProductById(id).orElseGet(() -> {
            //TODO get from openfoodfacts database; for now use dummy
            final Product p = new Product();
            p.setId(id);
            p.setName("Product " + id);
            p.setDescription("Description for product " + id);
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

    public void updateProductData(final String id, final String data) {
        final Product p = getProduct(id);
        p.setData(data);
        productRepository.save(p);
    }
}
