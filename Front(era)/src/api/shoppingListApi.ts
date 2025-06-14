// src/api/shoppingListApi.ts

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export async function fetchPendingShoppingLists(token: string) {
    const res = await fetch(`${BASE_URL}/api/shopping-lists/pending`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) throw new Error("Error fetching pending shopping lists");
    return res.json();
}

export async function fetchHistoryShoppingLists(token: string) {
    const res = await fetch(`${BASE_URL}/api/shopping-lists/history`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) throw new Error("Error fetching history shopping lists");
    return res.json();
}

export async function fetchShoppingListById(id: number, token: string) {
    const res = await fetch(`${BASE_URL}/api/shopping-lists/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) throw new Error("Error fetching shopping list");
    return res.json();
}

export async function toggleShoppingListItem(listId: number, itemId: number, token: string) {
    const res = await fetch(`${BASE_URL}/api/shopping-lists/${listId}/items/${itemId}/toggle`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) throw new Error("Error toggling shopping list item");
}

export async function repeatShoppingList(listId: number, token: string) {
    const res = await fetch(`${BASE_URL}/api/shopping-lists/${listId}/repeat`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) throw new Error("Error repeating shopping list");
}

export async function deleteShoppingList(listId: number, token: string) {
    const res = await fetch(`${BASE_URL}/api/shopping-lists/${listId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) throw new Error("Error deleting shopping list");
}

export async function createShoppingList(payload: any, token: string) {
    const res = await fetch(`${BASE_URL}/api/shopping-lists`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Error creating shopping list");
    return res.json();
}
