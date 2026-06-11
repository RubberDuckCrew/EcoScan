package com.rubberduckcrew.ecoscan_backend.products;

import com.rubberduckcrew.ecoscan_backend.food_data.FoodDataRepository;
import com.rubberduckcrew.ecoscan_backend.products.entity.Product;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
	private final FoodDataRepository foodDataRepository;

    public Product getProduct(final String id) {
        return productRepository.getProductById(id).orElseThrow(() -> new
		 ResponseStatusException(HttpStatus.NOT_FOUND,
            "Product with id " + id + " not found"));
    }

	public Object getProductFromOpenFoodFacts(final String id) {
		return toProduct(foodDataRepository.getProduct(id));
	}

	public Product toProduct(Map<String, Object> json) {
		Product product = new Product();
		//TODO save 'categories' in Product-DB
		//TODO remove leading 0s
		product.setId((String) json.get("code"));
		product.setName((String) json.get("product_name"));
		//product.setImageUrl((String) json.get("imageUrl"));
		product.setDescription((String) json.get("labels_tags"));
		return product;
	}

	private Object cleanValue(final Object value) {
		if (value != null && !value.getClass().getPackageName().startsWith("java.lang")) {
			return value.toString();
		}
		return value;
	}
}
