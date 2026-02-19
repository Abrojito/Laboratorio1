package com.dishly.app.config;

import com.dishly.app.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", config);
        return src;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .securityMatcher("/api/**")
                .authorizeHttpRequests(auth -> auth
                        //auth
                        .requestMatchers("/api/auth/**").permitAll()
                        //users
                        .requestMatchers("/api/users/**").authenticated()
                        //recipes
                        .requestMatchers(HttpMethod.PUT, "/api/recipes/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/recipes/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/recipes").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/recipes/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/recipes/*/reviews").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/recipes/*/reviews").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/recipes/search").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/search/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/favorites/recipes/**").authenticated()
                        .requestMatchers(HttpMethod.POST,   "/api/favorites/recipes/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/favorites/recipes/**").authenticated()
                        //mealpreps
                        .requestMatchers(HttpMethod.GET, "/api/mealpreps").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/mealpreps/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/mealpreps/user/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/mealpreps").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/mealpreps/*").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/mealpreps/*").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/mealpreps/*/reviews").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/mealpreps/*/reviews").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/mealpreps/search").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/mealpreps/search/cursor").permitAll()
                        .requestMatchers(HttpMethod.GET,"/api/favorites/mealpreps/**").authenticated()
                        .requestMatchers(HttpMethod.POST,   "/api/favorites/mealpreps/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/favorites/mealpreps/**").authenticated()
                        // shopping-lists
                        .requestMatchers(HttpMethod.GET, "/api/shopping-lists").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/shopping-lists/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/shopping-lists").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/shopping-lists/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/shopping-lists/*/repeat").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/shopping-lists/*/items/*/toggle").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/shopping-lists/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/shopping-lists/*/add-recipes").authenticated()
                        .requestMatchers(HttpMethod.OPTIONS, "/api/shopping-lists/**").permitAll()
                        //collections
                        .requestMatchers(HttpMethod.GET, "/api/collections/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/collections/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/collections/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/collections/**").authenticated()
                        //undesired ingredients
                        .requestMatchers(HttpMethod.GET,"/api/undesired/**").authenticated()
                        .requestMatchers(HttpMethod.POST,"/api/undesired/**").authenticated()
                        .requestMatchers(HttpMethod.PUT,"/api/undesired/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE,"/api/undesired/**").authenticated()

                        //catch-all
                        .anyRequest().denyAll()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config
    ) throws Exception {
        return config.getAuthenticationManager();
    }
}
