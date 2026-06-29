package com.rubberduckcrew.ecoscan_backend.products;

import com.rubberduckcrew.ecoscan_backend.products.dto.ProductDTO;
import com.rubberduckcrew.ecoscan_backend.products.dto.ProductResponse;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/product")
public class ProductController {

    private final ProductMapper productMapper;

    private final ProductService productService;

    @GetMapping("/{id}")
    public ProductResponse getProductById(@PathVariable final String id) {
        if (productService.hasProductBeenScanned(id)) {
            log.info("Product with id {} has been scanned, returning scanned product data", id);
            return productMapper.toDataDTO(productService.getScannedProduct(id));
        }
        return productMapper.toDTO(productService.getProduct(id));
    }

    @GetMapping("/openfoodfacts/{id}")
    public ProductDTO getProductByIdTool(@PathVariable final String id) {
        return productMapper.toDTO(productService.getProductFromOpenFoodFacts(id));
    }

    @PostMapping("/analyze/{id}")
    public UUID analyzeProduct(@PathVariable final String id) {
        return productService.analyzeProduct(id);
    }

    @GetMapping("/by-category/{category}")
    public List<ProductDTO> getProductsByCategory(@PathVariable String category) {
        return productService.getProductsByCategory(category);
    }
}
