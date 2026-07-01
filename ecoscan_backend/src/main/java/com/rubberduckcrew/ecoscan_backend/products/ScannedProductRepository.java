package com.rubberduckcrew.ecoscan_backend.products;

import com.rubberduckcrew.ecoscan_backend.products.entity.ScannedProduct;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ScannedProductRepository extends JpaRepository<ScannedProduct, String> {
    Optional<ScannedProduct> getScannedProductById(String id);
}
