# ---------- Build ----------
FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /workspace

# Download dependencies first so they are cached between builds
COPY pom.xml .
RUN mvn -q -B dependency:go-offline

COPY src src
# Tests run outside the image build (they need Docker for Testcontainers)
RUN mvn -q -B -DskipTests package && cp target/*.jar app.jar

# ---------- Runtime ----------
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app
COPY --from=build /workspace/app.jar app.jar
USER app

EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=3s --start-period=40s --retries=5 \
  CMD wget -qO- http://localhost:8080/actuator/health/readiness | grep -q UP || exit 1

ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
