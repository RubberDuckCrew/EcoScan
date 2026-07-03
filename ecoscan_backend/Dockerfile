FROM eclipse-temurin:25.0.3_9-jre@sha256:d0eb1b9018b3044da1b7346f39e945f71095749853d69a3aa16b8c99dad9bb45

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
