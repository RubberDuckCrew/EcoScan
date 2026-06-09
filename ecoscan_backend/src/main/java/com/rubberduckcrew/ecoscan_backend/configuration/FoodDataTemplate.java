package com.rubberduckcrew.ecoscan_backend.configuration;

import javax.sql.DataSource;
import org.springframework.jdbc.core.JdbcTemplate;

public class FoodDataTemplate extends JdbcTemplate {
    public FoodDataTemplate(final DataSource dataSource) {
        super(dataSource);
    }
}
