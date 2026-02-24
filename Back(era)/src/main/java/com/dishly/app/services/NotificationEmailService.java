package com.dishly.app.services;

import com.dishly.app.models.MealPrepModel;
import com.dishly.app.models.RecipeModel;
import com.dishly.app.models.UserModel;
import com.dishly.app.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationEmailService {

    private static final Logger log = LoggerFactory.getLogger(NotificationEmailService.class);

    private final JavaMailSender mailSender;
    private final UserRepository userRepository;
    private final String frontendBaseUrl;
    private final String fromAddress;

    public NotificationEmailService(
            JavaMailSender mailSender,
            UserRepository userRepository,
            @Value("${app.frontendBaseUrl:http://localhost:5173}") String frontendBaseUrl,
            @Value("${app.mail.from:}") String appMailFrom,
            @Value("${spring.mail.username:}") String mailUsername
    ) {
        this.mailSender = mailSender;
        this.userRepository = userRepository;
        this.frontendBaseUrl = frontendBaseUrl;
        String resolvedFrom = null;
        if (appMailFrom != null && !appMailFrom.isBlank() && appMailFrom.contains("@")) {
            resolvedFrom = appMailFrom;
        } else if (mailUsername != null && !mailUsername.isBlank()) {
            resolvedFrom = mailUsername;
        }
        this.fromAddress = resolvedFrom;
        if (this.fromAddress == null || this.fromAddress.isBlank()) {
            log.warn("SMTP from address is missing. Emails will not be sent.");
        } else {
            log.info("SMTP from address resolved to {}", this.fromAddress);
        }
    }

    @Async
    @Transactional(readOnly = true)
    public void sendNewMealPrepToFollowers(UserModel author, MealPrepModel mp) {
        sendToFollowers(
                "mealprep",
                author,
                mp.getId(),
                mp.getName(),
                "Nuevo meal prep de ",
                frontendBaseUrl + "/mealpreps/" + mp.getId()
        );
    }

    @Async
    @Transactional(readOnly = true)
    public void sendNewRecipeToFollowers(UserModel author, RecipeModel recipe) {
        sendToFollowers(
                "recipe",
                author,
                recipe.getId(),
                recipe.getName(),
                "Nueva receta de ",
                frontendBaseUrl + "/recipes/" + recipe.getId()
        );
    }

    public void sendTestMail(String to) {
        if (fromAddress == null || fromAddress.isBlank()) {
            log.warn("Skipping test email send because fromAddress is not configured.");
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject("Dishly test email");
        message.setText("Si ves esto en MailHog, funciona.");
        mailSender.send(message);
        log.info("Test email sent to {}", to);
    }

    private void sendToFollowers(
            String eventType,
            UserModel author,
            Long entityId,
            String entityTitle,
            String subjectPrefix,
            String detailLink
    ) {
        if (fromAddress == null || fromAddress.isBlank()) {
            log.warn("Skipping email notification because fromAddress is not configured.");
            return;
        }
        log.info("Email notification start: event={} id={} title={}", eventType, entityId, entityTitle);
        log.info("Author -> id={}, username={}, email={}", author.getId(), author.getUsername(), author.getEmail());
        try {
            UserModel authorWithFollowers = userRepository.findByIdWithFollowers(author.getId()).orElse(null);
            if (authorWithFollowers == null) {
                log.warn("Author not found for notification. authorId={}", author.getId());
                return;
            }

            int followersCount = authorWithFollowers.getFollowers().size();
            log.info("Followers found: {}", followersCount);

            List<String> recipients = authorWithFollowers.getFollowers().stream()
                    .map(UserModel::getEmail)
                    .filter(email -> email != null && !email.isBlank())
                    .distinct()
                    .toList();
            log.info("Recipients with valid email: {}", recipients.size());

            if (recipients.isEmpty()) {
                log.info("No valid recipients. Notification skipped for event={} id={}", eventType, entityId);
                return;
            }

            String subject = subjectPrefix + authorWithFollowers.getUsername();
            String body = "Nuevo contenido publicado: " + entityTitle
                    + "\n\nVer detalle: " + detailLink
                    + "\n\nDishly";

            int sentCount = 0;
            for (String recipient : recipients) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromAddress);
                message.setTo(recipient);
                message.setSubject(subject);
                message.setText(body);
                mailSender.send(message);
                sentCount++;
                log.info("sent to {}", recipient);
            }
            log.info("Notification finished: event={} id={} sentCount={}", eventType, entityId, sentCount);
        } catch (Exception e) {
            log.error("No se pudo enviar notificacion event={} id={}", eventType, entityId, e);
        }
    }
}
