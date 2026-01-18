package com.bank.loanpricing.kafka;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class LoanEventProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private static final String TOPIC = "loan-events";

    public void publishEvent(String message) {
        kafkaTemplate.send(TOPIC, message);
        System.out.println("Kafka event published: " + message);
    }
}
