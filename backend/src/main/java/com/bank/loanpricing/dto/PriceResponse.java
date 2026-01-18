package com.bank.loanpricing.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PriceResponse {
    private double calculatedPrice;
}
