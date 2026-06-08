
package com.rubberduckcrew.ecoscan_backend.configuration;

import com.rubberduckcrew.ecoscanai.api.AlternativesApi;
import com.rubberduckcrew.ecoscanai.api.GreenScoreApi;
import com.rubberduckcrew.ecoscanai.client.ApiClient;
import java.net.http.HttpClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
public class ApiClientConfiguration {

    @Value("${ai.api.base-url}")
    private String baseUrl;

    @Bean
    public ApiClient apiClient() {

        final RestClient restClient = RestClient.builder()
            .baseUrl(baseUrl)
            .requestFactory(new JdkClientHttpRequestFactory(
                HttpClient.newBuilder()
                    .version(HttpClient.Version.HTTP_1_1)
                    .build()))
            .build();

        final ApiClient client = new ApiClient(restClient);
        client.setBasePath(baseUrl);
        return client;
    }

    @Bean
    public GreenScoreApi greenScoreApi(final ApiClient apiClient) {
        return new GreenScoreApi(apiClient);
    }

    @Bean
    public AlternativesApi alternativesApi(final ApiClient apiClient) {
        return new AlternativesApi(apiClient);
    }

}