package com.rubberduckcrew.ecoscan_backend.food_data;

import com.rubberduckcrew.ecoscan_backend.configuration.FoodDataTemplate;
import com.rubberduckcrew.ecoscan_backend.products.entity.Product;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Repository;
import org.springframework.web.server.ResponseStatusException;

@Repository
@RequiredArgsConstructor
public class FoodDataRepository {
    private final FoodDataTemplate foodDataTemplate;

    public Product getProduct(final String id) {
        final String sql = """
                SELECT
                    code,
                    product_name[1].text AS product_name,
                    categories
                FROM food
                WHERE code = ?
            """;

        final List<Map<String, Object>> results = foodDataTemplate.queryForList(sql, id);
        if (results.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Product " + id + " not found");
        }

        return toProduct(results.getFirst());
    }

    public Product toProduct(final Map<String, Object> json) {
        final Product product = new Product();
        product.setId((String) json.get("code"));
        product.setName((String) json.get("product_name"));
        String categories = (String) json.get("categories");
        if (categories == null) {
            categories = "{}";
        }
        product.setCategories(categories);
        product.setDescription("");
        product.setImageUrl(OpenFoodFactsImageUtil.getFrontImageUrl(product.getId()));
        product.setData("");
        return product;
    }

    public List<Product> getProductsByCategory(final String category) {
        final String sql = """
            SELECT code, product_name[1].text AS product_name, categories
            FROM food
            WHERE categories ILIKE ?
            LIMIT 5
            """;
        return foodDataTemplate.queryForList(sql, "%" + category + "%")
            .stream()
            .map(this::toProduct)
            .toList();
    }
}
