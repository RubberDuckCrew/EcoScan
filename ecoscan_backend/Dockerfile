FROM eclipse-temurin:25.0.3_9-jre

RUN apt-get update && \
    apt-get install -y wget && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN useradd -u 10001 -s /sbin/nologin appuser && \
    chown -R appuser:appuser /app

COPY --chown=appuser:appuser target/*.jar app.jar

USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
