package com.rubberduckcrew.ecoscan_backend.alternatives;

import com.rubberduckcrew.ecoscan_backend.products.entity.Product;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class HandleAlternativeService {
    public void handleAlternativeProduct(final Product alternativeProduct) {
        log.info("need to be implemented: " + alternativeProduct.toString());
    }
}
