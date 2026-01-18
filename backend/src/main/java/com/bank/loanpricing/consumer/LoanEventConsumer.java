package com.bank.loanpricing.consumer;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class LoanEventConsumer {

    @KafkaListener(topics = "loan-events", groupId = "loan-group")
    public void listen(String message) {
        System.out.println("Received Kafka Event: " + message);
    }
}
