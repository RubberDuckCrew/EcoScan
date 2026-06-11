package com.rubberduckcrew.ecoscan_backend.products;

import com.rubberduckcrew.ecoscan_backend.products.dto.ProductDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/product")
public class ProductController {

    private final ProductMapper productMapper;

    private final ProductService productService;

    @GetMapping("/{id}")
    public ProductDTO getProductById(@PathVariable final String id) {
        return productMapper.toDTO(productService.getProductFromOpenFoodFacts(id));
    }
}
