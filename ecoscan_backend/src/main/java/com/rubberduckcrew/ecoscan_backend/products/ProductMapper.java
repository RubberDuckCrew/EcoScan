package com.rubberduckcrew.ecoscan_backend.products;

import com.rubberduckcrew.ecoscan_backend.products.dto.ProductDTO;
import com.rubberduckcrew.ecoscan_backend.products.entity.Product;
import org.mapstruct.Mapper;

@Mapper
public interface ProductMapper {

    ProductDTO toDTO(Product product);
}
