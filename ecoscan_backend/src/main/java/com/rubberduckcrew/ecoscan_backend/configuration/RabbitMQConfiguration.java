package com.rubberduckcrew.ecoscan_backend.configuration;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;

import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfiguration {

    public static final String AI_RESULTS_QUEUE = "ai_results";
    public static final String AI_RESULTS_DLQ = "ai_results_dlq";
    public static final String DLQ_EXCHANGE = "ai_results_dlx";

    @Bean
    public Queue aiResultsQueue() {
        return QueueBuilder.durable(AI_RESULTS_QUEUE)
                .withArgument("x-dead-letter-exchange", DLQ_EXCHANGE)
                .build();
    }

    @Bean
    public Queue aiResultsDlq() {
        return QueueBuilder.durable(AI_RESULTS_DLQ).build();
    }

    @Bean
    public DirectExchange aiResultsDlx() {
        return new DirectExchange(DLQ_EXCHANGE, true, false);
    }

    @Bean
    public Binding dlqBinding() {
        return BindingBuilder.bind(aiResultsDlq())
                .to(aiResultsDlx())
                .with("ai_results");
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new JacksonJsonMessageConverter();
    }

}
