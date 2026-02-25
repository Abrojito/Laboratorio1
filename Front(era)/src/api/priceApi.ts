import { getAuthHeaders } from "./config";
import { PriceQuoteResponse } from "../types/Prices";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export async function quotePrices(
    items: { name: string; quantityText: string }[]
): Promise<PriceQuoteResponse> {
    const res = await fetch(`${BASE_URL}/api/prices/quote`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
        },
        body: JSON.stringify({ items }),
    });

    if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "No se pudo calcular precios");
    }

    return res.json();
}
