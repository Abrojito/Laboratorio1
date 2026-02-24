package com.dishly.app.controllers;

import com.dishly.app.models.UserModel;
import com.dishly.app.repositories.UserRepository;
import com.dishly.app.services.NotificationEmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private static final Logger log = LoggerFactory.getLogger(NotificationController.class);

    private final NotificationEmailService notificationEmailService;
    private final UserRepository userRepository;

    public NotificationController(NotificationEmailService notificationEmailService, UserRepository userRepository) {
        this.notificationEmailService = notificationEmailService;
        this.userRepository = userRepository;
    }

    @PostMapping("/test")
    public ResponseEntity<String> sendTestNotification(Authentication auth) {
        String principal = auth.getName();
        log.info("Notification test requested by principal={}", principal);
        UserModel user = userRepository.findByEmail(principal)
                .or(() -> userRepository.findByUsername(principal))
                .orElse(null);

        if (user == null || user.getEmail() == null || user.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body("Usuario autenticado sin email valido.");
        }

        notificationEmailService.sendTestMail(user.getEmail());
        return ResponseEntity.ok("Mail de prueba enviado a " + user.getEmail());
    }
}
