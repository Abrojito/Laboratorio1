plugins {
	java
	id("org.springframework.boot") version "3.4.4"
	id("io.spring.dependency-management") version "1.1.7"
}

group = "com.dishly"
version = "0.0.1-SNAPSHOT"

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(21)
	}
}

repositories {
	mavenCentral()
}

dependencies {
	implementation("org.springframework.boot:spring-boot-starter-data-jpa")
	implementation("org.springframework.boot:spring-boot-starter-web")
	implementation("org.springframework.boot:spring-boot-starter-security")
	implementation("org.springframework.boot:spring-boot-starter-mail")
	implementation("com.github.librepdf:openpdf:1.3.43")
	implementation("org.postgresql:postgresql:42.7.3")
	implementation("io.jsonwebtoken:jjwt-api:0.11.5")
	implementation("com.google.api-client:google-api-client:2.7.2")
	runtimeOnly("io.jsonwebtoken:jjwt-impl:0.11.5")
	runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.11.5")
	runtimeOnly("org.hsqldb:hsqldb")
	compileOnly("org.projectlombok:lombok:1.18.38")
	annotationProcessor("org.projectlombok:lombok:1.18.38")
	testCompileOnly("org.projectlombok:lombok:1.18.38")
	testAnnotationProcessor("org.projectlombok:lombok:1.18.38")
	testImplementation("org.springframework.boot:spring-boot-starter-test")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")
	implementation ("org.springframework.boot:spring-boot-starter-validation")
	runtimeOnly("org.postgresql:postgresql")

}

tasks.withType<Test> {
	useJUnitPlatform()
}

/* ---------- HSQLDB JAR helper ---------- */

// 1) configuración ad-hoc para descargar solo el JAR
val hsqldbJar by configurations.creating

// 2) asociamos la dependencia a esa configuración
dependencies {
	hsqldbJar("org.hsqldb:hsqldb:2.7.3")
}

// 3) tarea que copia el JAR a build/hsqldb
tasks.register<Copy>("copyHsqldbJar") {
	description = "Copia hsqldb-2.7.3.jar a build/hsqldb/"
	from(hsqldbJar)
	into("$buildDir/hsqldb")
}
