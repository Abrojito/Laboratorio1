package com.dishly.app.controllers;

import com.dishly.app.dto.userdto.*;
import com.dishly.app.models.UserModel;
import com.dishly.app.security.JwtUtil;
import com.dishly.app.services.UserService;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
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

import java.util.Collections;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuthController {
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

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
        if (googleClientId == null || googleClientId.isBlank()) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Google auth no configurado: falta app.google.clientId / GOOGLE_CLIENT_ID");
        }
        if (request == null || request.idToken() == null || request.idToken().isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Google idToken invalido");
        }

        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance()
            ).setAudience(Collections.singletonList(googleClientId)).build();

            GoogleIdToken idToken = verifier.verify(request.idToken());
            if (idToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Google idToken invalido");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String googleId = payload.getSubject();
            Object nameObj = payload.get("name");
            String name = nameObj != null ? String.valueOf(nameObj) : null;

            if (email == null || email.isBlank()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token Google sin email");
            }

            log.info("Google auth attempt for email={}", email);
            UserModel user = userService.resolveOrCreateGoogleUser(email, name, googleId);
            String token = jwtUtil.generateToken(user.getEmail(), user.getUsername());
            return ResponseEntity.ok(new LoginResponse(token));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Google idToken invalido");
        }
    }
}
