export interface Page<T> {
    content: T[];
    number: number;
    totalPages: number;
    totalElements: number;
}

export type PagedResponse<T> = {
    items: T[];
    nextCursor: string | null;
    hasNext: boolean;
};
