import { useCallback, useEffect, useRef, useState } from "react";
import { PagedResponse } from "../types/Page";

export function useCursorPagination<T>(
    fetchPage: (cursor: string | null) => Promise<PagedResponse<T>>
) {
    const [items, setItems] = useState<T[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasNext, setHasNext] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const hasLoadedInitial = useRef(false);
    const [resetCounter, setResetCounter] = useState(0);
    const loadingRef = useRef(false);
    const requestVersionRef = useRef(0);

    const dedupeById = (list: T[]): T[] => {
        const seen = new Set<string | number>();
        const deduped: T[] = [];

        for (const item of list) {
            if (item && typeof item === "object" && "id" in (item as object)) {
                const id = (item as { id: string | number }).id;
                if (seen.has(id)) continue;
                seen.add(id);
            }
            deduped.push(item);
        }

        return deduped;
    };

    const loadMore = useCallback(async () => {
        if (loadingRef.current || !hasNext) return;

        loadingRef.current = true;
        setIsLoading(true);
        setError(null);
        const currentVersion = requestVersionRef.current;
        try {
            const page = await fetchPage(cursor);
            if (currentVersion !== requestVersionRef.current) return;
            setItems(prev => dedupeById([...prev, ...page.items]));
            setCursor(page.nextCursor);
            setHasNext(page.hasNext);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Error cargando datos");
            }
        } finally {
            loadingRef.current = false;
            setIsLoading(false);
        }
    }, [cursor, fetchPage, hasNext]);

    useEffect(() => {
        if (hasLoadedInitial.current) return;
        hasLoadedInitial.current = true;
        loadMore();
    }, [loadMore, resetCounter]);

    const reset = useCallback(() => {
        requestVersionRef.current += 1;
        loadingRef.current = false;
        setItems([]);
        setCursor(null);
        setHasNext(true);
        setError(null);
        hasLoadedInitial.current = false;
        setResetCounter(prev => prev + 1);
    }, []);

    return {
        items,
        loadMore,
        isLoading,
        hasNext,
        error,
        reset,
    };
}
