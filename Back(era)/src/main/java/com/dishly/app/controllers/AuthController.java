package com.dishly.app.controllers;

import com.dishly.app.dto.userdto.*;
import com.dishly.app.models.UserModel;
import com.dishly.app.security.JwtUtil;
import com.dishly.app.services.UserService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuthController {
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final AuthenticationManager authenticationManager;
    private final JwtUtil      jwtUtil;
    private final UserService  userService;
    private final String googleClientId;

    @Autowired                     // ← inyección por constructor
    public AuthController(AuthenticationManager authenticationManager,
                          JwtUtil jwtUtil,
                          UserService userService,
                          @Value("${app.google.clientId:}") String googleClientId) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil      = jwtUtil;
        this.userService  = userService;
        this.googleClientId = googleClientId;
    }

    /* ---------- LOGIN ---------- */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.email(),
                            request.password()
                    )
            );

            UserModel user = userService.getByEmail(request.email())
                    .orElseThrow(() ->
                            new UsernameNotFoundException("User not found"));

            String token = jwtUtil.generateToken(user.getEmail(), user.getUsername());

            return ResponseEntity.ok(new LoginResponse(token));

        } catch (AuthenticationException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Email or password is incorrect");
        }
    }

    /* ---------- REGISTRO y CRUD (sin cambios) ---------- */

    @GetMapping("/{id}")
    public ResponseEntity<UserModel> get(@PathVariable Long id) {
        return userService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            UserModel user = userService.register(request);
            return ResponseEntity.ok(new RegisterResponse(user.getId()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(ex.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserModel> update(@PathVariable Long id,
                                            @RequestBody UpdateRequest req) {
        return ResponseEntity.ok(userService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleAuth(@RequestBody GoogleAuthRequest request) {
        log.info("Google auth endpoint reached");
        log.info("Google auth configured clientId={}", googleClientId);

        String rawToken = request != null ? request.idToken() : null;
        boolean tokenBlank = rawToken == null || rawToken.isBlank();
        int tokenLength = rawToken == null ? 0 : rawToken.length();
        int dotCount = rawToken == null ? 0 : (int) rawToken.chars().filter(ch -> ch == '.').count();
        boolean hasJwtShape = dotCount == 2;
        String tokenPrefix = rawToken == null ? "" : rawToken.substring(0, Math.min(10, rawToken.length()));
        log.info("Google idToken diagnostics: nullOrBlank={}, length={}, has3Parts={}, prefix10={}",
                tokenBlank, tokenLength, hasJwtShape, tokenPrefix);
        log.info("Google auth serverTimeEpochSeconds={}", Instant.now().getEpochSecond());

        if (googleClientId == null || googleClientId.isBlank()) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Google auth no configurado: falta app.google.clientId / GOOGLE_CLIENT_ID");
        }
        if (tokenBlank) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Google idToken invalido");
        }

        Map<String, Object> unverified = null;
        try {
            unverified = decodeJwtPayloadNoVerify(rawToken);
            log.info("Google unverified payload: aud={}, azp={}, iss={}, exp={}, iat={}, email={}, sub={}",
                    unverified.get("aud"),
                    unverified.get("azp"),
                    unverified.get("iss"),
                    unverified.get("exp"),
                    unverified.get("iat"),
                    unverified.get("email"),
                    unverified.get("sub"));
        } catch (Exception ex) {
            log.warn("Google unverified payload decode failed: {}", ex.getMessage());
        }

        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance()
            ).setAudience(Collections.singletonList(googleClientId)).build();

            GoogleIdToken idToken = verifier.verify(rawToken);
            if (idToken == null) {
                log.warn("Google idToken verification returned null (invalid token or audience mismatch)");
                if (unverified != null) {
                    log.warn("verify=null unverified payload: aud={}, iss={}, exp={}, iat={}",
                            unverified.get("aud"),
                            unverified.get("iss"),
                            unverified.get("exp"),
                            unverified.get("iat"));
                }
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Google idToken invalido");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String googleId = payload.getSubject();
            Object nameObj = payload.get("name");
            String name = nameObj != null ? String.valueOf(nameObj) : null;
            Object aud = payload.getAudience();
            Object iss = payload.getIssuer();
            log.info("Google payload: email={}, aud={}, iss={}, sub={}", email, aud, iss, googleId);

            if (email == null || email.isBlank()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token Google sin email");
            }

            log.info("Google auth attempt for email={}", email);
            UserModel user = userService.resolveOrCreateGoogleUser(email, name, googleId);
            String token = jwtUtil.generateToken(user.getEmail(), user.getUsername());
            return ResponseEntity.ok(new LoginResponse(token));
        } catch (IllegalArgumentException ex) {
            log.warn("Google token verification illegal argument: {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Google idToken invalido");
        } catch (Exception ex) {
            log.warn("Google token verification error: {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Google idToken invalido");
        }
    }

    private Map<String, Object> decodeJwtPayloadNoVerify(String jwt) throws Exception {
        String[] parts = jwt.split("\\.");
        if (parts.length < 2) {
            throw new IllegalArgumentException("Token without payload part");
        }
        byte[] decoded = Base64.getUrlDecoder().decode(parts[1]);
        String json = new String(decoded, StandardCharsets.UTF_8);
        return OBJECT_MAPPER.readValue(json, Map.class);
    }
}
