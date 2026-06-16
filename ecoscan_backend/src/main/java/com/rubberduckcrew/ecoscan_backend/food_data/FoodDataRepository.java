package com.rubberduckcrew.ecoscan_backend.food_data;

import com.rubberduckcrew.ecoscan_backend.configuration.FoodDataTemplate;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Repository;
import org.springframework.web.server.ResponseStatusException;

@Repository
@RequiredArgsConstructor
public class FoodDataRepository {
    private final FoodDataTemplate foodDataTemplate;
    private final static String TABLE_PATH = "read_parquet('data/food/food.parquet')";

    public Map<String, Object> getProduct(final String id) {
        //TODO nicht alle Spalten und labelTags funktionsfähig machen
        final String sql = """
        SELECT
            code,
            product_name[1].text AS product_name,
            labels_tags
        FROM ?
        WHERE code = ?
    """;

        List<Map<String, Object>> results = foodDataTemplate.queryForList(sql, TABLE_PATH, id);
        if (results.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Product " + id + " not found");
        }

        return results.getFirst();
    }
}
