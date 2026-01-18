package com.bank.loanpricing;

import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.data.mongo.MongoDataAutoConfiguration;
import org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@EnableAutoConfiguration(exclude = {MongoDataAutoConfiguration.class, KafkaAutoConfiguration.class})
class LoanpricingApplicationTests {

	@Test
	void contextLoads() {
	}

}
