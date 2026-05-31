package com.rubberduckcrew.ecoscan_backend.messaging;

import com.rubberduckcrew.ecoscanai.model.JobResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class AiResultListener {

    @RabbitListener(queues = "ai_results")
    public void handleResult(@Payload JobResponse msg) {
        log.info("Job {} finished with status {}", msg.getJobId(), msg.getStatus());
        log.info("Result: {}", msg.getResult());
        //TODO: Do something
    }
}
