package com.dishly.app.services;

import com.dishly.app.dto.*;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DemoPriceIndexService {
    private static final Logger log = LoggerFactory.getLogger(DemoPriceIndexService.class);

    private static final Set<String> STOPWORDS = Set.of("de", "la", "el", "y");

    private volatile boolean loaded = false;
    private List<Entry> entries = List.of();
    private Map<String, List<Integer>> tokenIndex = Map.of();

    @PostConstruct
    public void init() {
        try {
            Resource resource = new ClassPathResource("prices/demo_prices.csv");
            if (!resource.exists()) {
                log.warn("Price CSV not found at classpath:prices/demo_prices.csv");
                return;
            }

            List<String> lines = new ArrayList<>();
            try (BufferedReader br = new BufferedReader(
                    new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = br.readLine()) != null) {
                    lines.add(line);
                }
            }

            if (lines.isEmpty()) {
                log.warn("Price CSV is empty");
                return;
            }

            ParsedData parsed = parseWithSeparator(lines, ',');
            if (parsed == null) {
                parsed = parseWithSeparator(lines, ';');
            }

            if (parsed == null) {
                log.warn("Price CSV could not be parsed with ',' or ';' separators");
                return;
            }

            this.entries = parsed.entries;
            this.tokenIndex = parsed.tokenIndex;
            this.loaded = true;

            log.info("Loaded demo price rows: {}", this.entries.size());
            log.info("Index tokens: {}", this.tokenIndex.size());
        } catch (Exception e) {
            loaded = false;
            log.error("Failed to initialize demo price index", e);
        }
    }

    public boolean isLoaded() {
        return loaded;
    }

    public PriceSearchResponseDTO search(String query, int limit) {
        List<ScoredEntry> ranked = rankCandidates(query, limit > 0 ? limit : 10);
        List<PriceSearchItemDTO> items = ranked.stream()
                .map(s -> new PriceSearchItemDTO(s.entry.description(), s.entry.price()))
                .toList();
        return new PriceSearchResponseDTO(items);
    }

    public PriceQuoteResponseDTO quote(List<PriceQuoteInputDTO> inputs) {
        List<PriceQuoteItemDTO> resultItems = new ArrayList<>();
        double total = 0d;

        if (inputs == null) {
            return new PriceQuoteResponseDTO(List.of(), 0d);
        }

        for (PriceQuoteInputDTO input : inputs) {
            String inputName = input == null ? null : input.name();
            List<ScoredEntry> top = rankCandidates(inputName, 8);

            if (top.isEmpty()) {
                resultItems.add(new PriceQuoteItemDTO(inputName, false, false, null, null, List.of()));
                continue;
            }

            int top1 = top.get(0).score;
            int top2 = top.size() > 1 ? top.get(1).score : Integer.MIN_VALUE;
            long closeCount = top.stream().filter(s -> s.score >= top1 - 2).count();

            boolean ambiguous = (top.size() > 1 && (top1 - top2) < 2) || closeCount >= 3;

            if (ambiguous) {
                List<PriceCandidateDTO> candidates = top.stream()
                        .map(s -> new PriceCandidateDTO(s.entry.description(), s.entry.price(), s.score))
                        .toList();
                resultItems.add(new PriceQuoteItemDTO(inputName, true, true, null, null, candidates));
            } else {
                Entry best = top.get(0).entry;
                total += best.price();
                resultItems.add(new PriceQuoteItemDTO(inputName, true, false, best.description(), best.price(), List.of()));
            }
        }

        return new PriceQuoteResponseDTO(resultItems, total);
    }

    private List<ScoredEntry> rankCandidates(String rawQuery, int limit) {
        String query = normalize(rawQuery);
        if (query.isBlank()) {
            return List.of();
        }

        Set<String> queryTokens = tokenize(query);
        if (queryTokens.isEmpty()) {
            return List.of();
        }

        Set<Integer> candidateIndices = new HashSet<>();
        for (String token : queryTokens) {
            candidateIndices.addAll(tokenIndex.getOrDefault(token, List.of()));
        }

        if (candidateIndices.isEmpty()) {
            for (int i = 0; i < entries.size(); i++) {
                if (entries.get(i).normalized().contains(query)) {
                    candidateIndices.add(i);
                }
            }
        }

        List<ScoredEntry> scored = new ArrayList<>();
        for (Integer idx : candidateIndices) {
            Entry e = entries.get(idx);
            int score = score(e, query, queryTokens);
            if (score > 0) {
                scored.add(new ScoredEntry(e, score));
            }
        }

        scored.sort(Comparator
                .comparingInt((ScoredEntry s) -> s.score).reversed()
                .thenComparingDouble(s -> s.entry.price())
                .thenComparing(s -> s.entry.description()));

        List<ScoredEntry> dedup = new ArrayList<>();
        Set<String> seenDescriptions = new HashSet<>();
        for (ScoredEntry s : scored) {
            if (seenDescriptions.add(s.entry.description())) {
                dedup.add(s);
                if (dedup.size() >= limit) {
                    break;
                }
            }
        }
        return dedup;
    }

    private int score(Entry entry, String query, Set<String> queryTokens) {
        int score = 0;
        for (String token : queryTokens) {
            if (entry.tokens().contains(token)) {
                score += 2;
            }
        }
        if (entry.normalized().contains(query)) {
            score += 5;
        }
        if (entry.normalized().startsWith(query)) {
            score += 3;
        }
        return score;
    }

    private ParsedData parseWithSeparator(List<String> lines, char separator) {
        List<String> header = parseCsvLine(lines.get(0), separator);
        Map<String, Integer> headerMap = new HashMap<>();
        for (int i = 0; i < header.size(); i++) {
            headerMap.put(header.get(i).trim().toLowerCase(Locale.ROOT), i);
        }

        Integer descIdx = headerMap.get("productos_descripcion");
        Integer priceIdx = headerMap.get("productos_precio_lista");
        if (descIdx == null || priceIdx == null) {
            return null;
        }

        List<Entry> loadedEntries = new ArrayList<>();
        Map<String, List<Integer>> idx = new HashMap<>();

        for (int row = 1; row < lines.size(); row++) {
            String line = lines.get(row);
            if (line == null || line.isBlank()) {
                continue;
            }
            List<String> cols = parseCsvLine(line, separator);
            int max = Math.max(descIdx, priceIdx);
            if (cols.size() <= max) {
                continue;
            }

            String description = cols.get(descIdx).trim();
            if (description.isBlank()) {
                continue;
            }

            Double price = parsePrice(cols.get(priceIdx));
            if (price == null) {
                log.warn("Skipping price row {} due to invalid price: {}", row + 1, cols.get(priceIdx));
                continue;
            }

            String normalized = normalize(description);
            if (normalized.isBlank()) {
                continue;
            }

            Set<String> tokens = tokenize(normalized);
            Entry entry = new Entry(description, normalized, price, tokens);
            loadedEntries.add(entry);
            int entryIdx = loadedEntries.size() - 1;
            for (String token : tokens) {
                idx.computeIfAbsent(token, k -> new ArrayList<>()).add(entryIdx);
            }
        }

        return new ParsedData(loadedEntries, idx);
    }

    private List<String> parseCsvLine(String line, char separator) {
        List<String> out = new ArrayList<>();
        if (line == null) {
            return out;
        }

        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    current.append('"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c == separator && !inQuotes) {
                out.add(current.toString());
                current.setLength(0);
            } else {
                current.append(c);
            }
        }
        out.add(current.toString());
        return out;
    }

    private Double parsePrice(String raw) {
        if (raw == null) {
            return null;
        }
        String s = raw.trim().replace(" ", "");
        if (s.isBlank()) {
            return null;
        }

        s = s.replace("$", "");

        int commaCount = (int) s.chars().filter(ch -> ch == ',').count();
        int dotCount = (int) s.chars().filter(ch -> ch == '.').count();

        if (commaCount > 0 && dotCount > 0) {
            int lastComma = s.lastIndexOf(',');
            int lastDot = s.lastIndexOf('.');
            if (lastComma > lastDot) {
                s = s.replace(".", "");
                s = s.replace(",", ".");
            } else {
                s = s.replace(",", "");
            }
        } else if (commaCount > 0) {
            int lastComma = s.lastIndexOf(',');
            int decimals = s.length() - lastComma - 1;
            if (commaCount == 1 && decimals <= 2) {
                s = s.replace(",", ".");
            } else {
                s = s.replace(",", "");
            }
        } else if (dotCount > 1) {
            int lastDot = s.lastIndexOf('.');
            s = s.substring(0, lastDot).replace(".", "") + s.substring(lastDot);
        }

        try {
            return Double.parseDouble(s);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String normalize(String text) {
        if (text == null) {
            return "";
        }
        String nfd = Normalizer.normalize(text, Normalizer.Form.NFD);
        String noAccents = nfd.replaceAll("\\p{M}+", "");
        return noAccents.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private Set<String> tokenize(String normalized) {
        if (normalized == null || normalized.isBlank()) {
            return Set.of();
        }
        return Arrays.stream(normalized.split(" "))
                .map(String::trim)
                .filter(t -> t.length() >= 2)
                .filter(t -> !STOPWORDS.contains(t))
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private record Entry(String description, String normalized, double price, Set<String> tokens) {}
    private record ParsedData(List<Entry> entries, Map<String, List<Integer>> tokenIndex) {}
    private record ScoredEntry(Entry entry, int score) {}
}

