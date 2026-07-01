package com.rubberduckcrew.ecoscan_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@SuppressWarnings("PMD.UseUtilityClass")
public class EcoscanBackendApplication {

    public static void main(final String[] args) {
        SpringApplication.run(EcoscanBackendApplication.class, args);
    }

}
