package com.rubberduckcrew.ecoscan_backend.configuration;

import jakarta.validation.constraints.NotBlank;
import org.duckdb.DuckDBDriver;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.datasource.SimpleDriverDataSource;
import org.springframework.validation.annotation.Validated;

@Configuration
@Validated
public class FoodDataConfiguration {
    @Value("${food-data.url}")
    @NotBlank(message = "food-data.url must be configured") private String duckdbUrl;

    @Bean
    public FoodDataTemplate duckDbTemplate() {
        final SimpleDriverDataSource dataSource = new SimpleDriverDataSource();
        dataSource.setDriverClass(DuckDBDriver.class);
        dataSource.setUrl(duckdbUrl);
        return new FoodDataTemplate(dataSource);
    }
}
