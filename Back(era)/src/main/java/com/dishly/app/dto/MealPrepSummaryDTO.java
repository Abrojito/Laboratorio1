package com.dishly.app.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class MealPrepSummaryDTO {
    private Long id;
    private String name;
    private String image;
}
