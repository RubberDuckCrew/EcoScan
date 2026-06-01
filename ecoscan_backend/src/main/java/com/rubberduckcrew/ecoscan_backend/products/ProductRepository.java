package com.rubberduckcrew.ecoscan_backend.products;

import com.rubberduckcrew.ecoscan_backend.products.entity.Product;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends CrudRepository<Product, String> {
    Optional<Product> getProductById(String id);
}
