package com.dishly.app;

import com.dishly.app.repositories.ReviewRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class DishlyApplication {

	public static void main(String[] args) {
		SpringApplication.run(DishlyApplication.class, args);
	}

	@Bean
	public CommandLineRunner testReviews(ReviewRepository repo) {
		return args -> {
			System.out.println("Cantidad de reviews: " + repo.count());
		};
	}

}
