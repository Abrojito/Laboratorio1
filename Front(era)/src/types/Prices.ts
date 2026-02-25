export interface PriceCandidate {
    description: string;
    price: number;
    score: number;
}

export interface PriceQuoteItem {
    inputName: string;
    found: boolean;
    ambiguous: boolean;
    matchedDescription?: string | null;
    price?: number | null;
    candidates?: PriceCandidate[];
}

export interface PriceQuoteResponse {
    items: PriceQuoteItem[];
    totalEstimated: number;
}
