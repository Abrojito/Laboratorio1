package com.dishly.app.dto;

import java.util.List;

public record PriceQuoteResponseDTO(
        List<PriceQuoteItemDTO> items,
        double totalEstimated
) {}

