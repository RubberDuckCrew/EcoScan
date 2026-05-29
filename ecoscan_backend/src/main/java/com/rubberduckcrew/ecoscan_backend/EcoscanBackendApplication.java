package com.rubberduckcrew.ecoscan_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.mongodb.autoconfigure.MongoAutoConfiguration;

@SpringBootApplication(
        exclude = {
                MongoAutoConfiguration.class, // TODO: Remove on mongo db integration
        }
)
@SuppressWarnings("PMD.UseUtilityClass")
public class EcoscanBackendApplication {

    public static void main(final String[] args) {
        SpringApplication.run(EcoscanBackendApplication.class, args);
    }

}
