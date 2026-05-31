package com.rubberduckcrew.ecoscan_backend.messaging;

import com.rubberduckcrew.ecoscanai.model.JobResponseStr;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class MessagingService {

    public void receivedTest(@Payload final JobResponseStr msg) {
        log.info("Received test");
    }
}
