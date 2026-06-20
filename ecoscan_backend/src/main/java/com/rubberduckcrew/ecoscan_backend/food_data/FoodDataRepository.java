package com.rubberduckcrew.ecoscan_backend.food_data;

import com.rubberduckcrew.ecoscan_backend.configuration.FoodDataTemplate;

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

    public Map<String, Object> getProduct(final String id) {
        final String sql = """
                SELECT
                    code,
                    product_name[1].text AS product_name,
                    categories
                FROM read_parquet('data/food/food.parquet')
                WHERE code = ?
            """;

        List<Map<String, Object>> results = foodDataTemplate.queryForList(sql, id);
        if (results.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Product " + id + " not found");
        }

        return results.getFirst();
    }
}
