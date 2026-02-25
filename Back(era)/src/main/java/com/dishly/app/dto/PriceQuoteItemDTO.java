package com.dishly.app.dto;

import java.util.List;

public record PriceQuoteItemDTO(
        String inputName,
        boolean found,
        boolean ambiguous,
        String matchedDescription,
        Double price,
        List<PriceCandidateDTO> candidates
) {}

