package org.example;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class MessageController {

    private static final Path DATA_FILE = Paths.get("data.txt");

    @PostMapping("/messages")
    public Map<String, String> receiveMessage(@RequestBody Map<String, String> body) {
        String text = body.get("text");

        if (text == null || text.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Поле 'text' не должно быть пустым");
        }

        String line = text.trim() + System.lineSeparator();

        try {
            Files.write(
                    DATA_FILE,
                    line.getBytes(StandardCharsets.UTF_8),
                    StandardOpenOption.CREATE,
                    StandardOpenOption.APPEND
            );
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Не удалось сохранить данные", e);
        }

        return Map.of("message", "Данные успешно сохранены");
    }

    @GetMapping("/messages")
    public Map<String, Object> getMessages(
            @RequestParam(value = "query", required = false) String query) {

        List<String> lines;
        try {
            if (Files.exists(DATA_FILE)) {
                lines = Files.readAllLines(DATA_FILE, StandardCharsets.UTF_8);
            } else {
                lines = Collections.emptyList();
            }
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Не удалось прочитать данные", e);
        }

        if (query != null && !query.trim().isEmpty()) {
            String needle = query.trim().toLowerCase(Locale.ROOT);
            lines = lines.stream()
                    .filter(line -> line.toLowerCase(Locale.ROOT).contains(needle))
                    .collect(Collectors.toList());
        }

        return Map.of("count", lines.size(), "lines", lines);
    }
}