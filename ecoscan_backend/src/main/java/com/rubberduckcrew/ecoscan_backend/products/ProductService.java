package com.rubberduckcrew.ecoscan_backend.products;

import com.rubberduckcrew.ecoscan_backend.products.entity.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public Product getProduct(final String id) {
        return productRepository.getProductById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
            "Product with id " + id + " not found"));
    }

}
