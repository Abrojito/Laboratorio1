package com.dishly.app.dto;

import java.util.List;

public record PriceQuoteRequestDTO(
        List<PriceQuoteInputDTO> items
) {}

