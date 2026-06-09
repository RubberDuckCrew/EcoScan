package com.rubberduckcrew.ecoscan_backend.food_data;

import com.rubberduckcrew.ecoscan_backend.configuration.FoodDataTemplate;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class FoodDataRepository {
    private final FoodDataTemplate foodDataTemplate;

    public List<Map<String, Object>> queryParquetData() {
        String sql = "SELECT code FROM food LIMIT 10";

        return foodDataTemplate.queryForList(sql);
    }
}