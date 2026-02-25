package com.dishly.app.dto;

import java.util.List;

public record PriceSearchResponseDTO(
        List<PriceSearchItemDTO> items
) {}

