FROM maven:3.10.0-eclipse-temurin-21-noble as build
WORKDIR /build

COPY pom.xml .
COPY src src

RUN ["mvn", "clean", "package"]

FROM eclipse-temurin:21
WORKDIR /app
COPY --from=build /build/target/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]