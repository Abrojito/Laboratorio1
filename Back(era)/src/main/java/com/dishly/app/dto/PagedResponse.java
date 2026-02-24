package com.dishly.app.dto;

import java.util.List;

public record PagedResponse<T>(
        List<T> items,
        String nextCursor,
        boolean hasNext
) {}
