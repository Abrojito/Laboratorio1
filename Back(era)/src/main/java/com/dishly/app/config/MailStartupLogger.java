package com.dishly.app.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class MailStartupLogger implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(MailStartupLogger.class);

    @Value("${spring.mail.host:}")
    private String host;

    @Value("${spring.mail.port:}")
    private String port;

    @Value("${spring.mail.username:}")
    private String username;

    @Override
    public void run(ApplicationArguments args) {
        log.info("SMTP config -> host={}, port={}, user={}", host, port, username);
    }
}

