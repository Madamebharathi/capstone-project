package com.bank.loanpricing;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.kafka.annotation.EnableKafka;

@SpringBootApplication
@EnableKafka
public class LoanpricingApplication {

	public static void main(String[] args) {
		SpringApplication.run(LoanpricingApplication.class, args);
	}

}
