package com.rubberduckcrew.ecoscan_backend.products;

import com.rubberduckcrew.ecoscan_backend.products.entity.ScannedProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ScannedProductRepository extends JpaRepository<ScannedProduct, String> {
    ScannedProduct getScannedProductById(String id);
}
