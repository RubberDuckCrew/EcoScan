package com.rubberduckcrew.ecoscan_backend.food_data;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("food-data")
@RequiredArgsConstructor
public class FoodDataController {
    private final FoodDataRepository foodDataRepository;

    @GetMapping
    public List<Map<String, Object>> test() {
        return foodDataRepository.queryParquetData().stream()
            .map(this::cleanRow)
            .toList();
    }

    private Map<String, Object> cleanRow(Map<String, Object> row) {
        return row.entrySet().stream()
            .collect(LinkedHashMap::new,
                (map, entry) -> map.put(entry.getKey(), cleanValue(entry.getValue())),
                Map::putAll);
    }

    private Object cleanValue(Object value) {
        if (value != null && !value.getClass().getPackageName().startsWith("java.lang")) {
            return value.toString();
        }
        return value;
    }
}
