package com.rubberduckcrew.ecoscan_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.mongodb.autoconfigure.MongoAutoConfiguration;

@SpringBootApplication(
        exclude = {
                MongoAutoConfiguration.class, // TODO: Remove on mongo db integration
        }
)
public class EcoscanBackendApplication {

    static void main(String[] args) {
        SpringApplication.run(EcoscanBackendApplication.class, args);
    }

}
