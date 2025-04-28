package com.dishly.app.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.Map;

@Component
public class JwtUtil {

    private static final String SECRET =
            "clavemuymuyseguraaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    private static final Key   KEY = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    private static final long  EXPIRATION_MS = 60 * 60 * 1000;  // 1 h

    /* ========= CREACIÓN ========= */

    /** subject = email  +  claim “username”. */
    public String generateToken(String email, String username) {
        return Jwts.builder()
                .setSubject(email)
                .addClaims(Map.of("username", username))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(KEY, SignatureAlgorithm.HS256)
                .compact();
    }

    /* ========= LECTURA ========= */

    public String getEmail(String token) {
        return parse(token).getBody().getSubject();
    }

    public String getUsername(String token) {
        return parse(token).getBody().get("username", String.class);
    }

    /* ========= VALIDACIÓN ====== */

    public boolean validateToken(String token) {
        try { parse(token); return true; }
        catch (JwtException | IllegalArgumentException ex) { return false; }
    }

    /* ========= HELPER ========== */

    private Jws<Claims> parse(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(KEY)
                .build()
                .parseClaimsJws(token);
    }
}
