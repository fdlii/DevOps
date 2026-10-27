import { useState } from "react";

const API_URL = "http://localhost:8080/api/messages";

function normalizeResult(data) {
  let lines = null;

  if (Array.isArray(data)) {
    lines = data;
  } else if (data && Array.isArray(data.lines)) {
    lines = data.lines;
  } else if (data && Array.isArray(data.messages)) {
    lines = data.messages;
  } else if (typeof data === "string") {
    return data.trim() ? data : "Ничего не найдено.";
  }

  if (lines) {
    return lines.length > 0 ? lines.join("\n") : "Ничего не найдено.";
  }

  return JSON.stringify(data, null, 2);
}

export default function App() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [result, setResult] = useState(""); 
  const [fetchStatus, setFetchStatus] = useState("idle");
  const [fetchError, setFetchError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const value = text.trim();
    if (!value) return;

    setStatus("loading");
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value }),
      });

      if (!response.ok) {
        throw new Error(`Сервер ответил статусом ${response.status}`);
      }

      setStatus("success");
      setText("");
    } catch (err) {
      setStatus("error");
      setError(err.message || "Не удалось отправить данные");
    }
  }

  async function handleFetch(event) {
    event.preventDefault();

    setFetchStatus("loading");
    setFetchError("");
    setResult("");

    try {
      const url = query.trim()
        ? `${API_URL}?query=${encodeURIComponent(query.trim())}`
        : API_URL;

      const response = await fetch(url, { method: "GET" });

      if (!response.ok) {
        throw new Error(`Сервер ответил статусом ${response.status}`);
      }

      const data = await response.json();
      console.log("Ответ сервера:", data);

      setResult(normalizeResult(data));
      setFetchStatus("idle");
    } catch (err) {
      setFetchStatus("error");
      setFetchError(err.message || "Не удалось получить данные");
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Сообщения</h1>

        <form onSubmit={handleSubmit} style={styles.block}>
          <label style={styles.label}>Новое сообщение</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Введите текст…"
            style={styles.input}
          />
          <button
            type="submit"
            disabled={status === "loading" || !text.trim()}
            style={styles.button}
          >
            {status === "loading" ? "Отправка…" : "Отправить"}
          </button>

          {status === "success" && (
            <p style={{ ...styles.message, color: "#15803d" }}>
              Данные успешно отправлены!
            </p>
          )}
          {status === "error" && (
            <p style={{ ...styles.message, color: "#b91c1c" }}>Ошибка: {error}</p>
          )}
        </form>

        <hr style={styles.divider} />

        <form onSubmit={handleFetch} style={styles.block}>
          <label style={styles.label}>
            Поиск по сохранённым сообщениям
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Оставьте пустым, чтобы показать все…"
            style={styles.input}
          />
          <button
            type="submit"
            disabled={fetchStatus === "loading"}
            style={{ ...styles.button, background: "#7c3aed" }}
          >
            {fetchStatus === "loading" ? "Загрузка…" : "Показать результат"}
          </button>

          {fetchStatus === "error" && (
            <p style={{ ...styles.message, color: "#b91c1c" }}>
              Ошибка: {fetchError}
            </p>
          )}

          <label style={styles.label}>Результат</label>
          <textarea
            value={result}
            readOnly
            placeholder="Здесь появится ответ сервера…"
            rows={6}
            style={styles.output}
          />
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "system-ui, sans-serif",
    background: "#f4f4f5",
    padding: "24px",
  },
  card: {
    width: "360px",
    padding: "24px",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  title: { margin: "0 0 16px", fontSize: "20px", textAlign: "center", color: "black" },
  block: { display: "flex", flexDirection: "column", gap: "10px" },
  label: { fontSize: "13px", fontWeight: 600, color: "#3f3f46" },
  input: {
    padding: "10px 12px",
    fontSize: "15px",
    border: "1px solid #d4d4d8",
    borderRadius: "8px",
    outline: "none",
  },
  output: {
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #d4d4d8",
    borderRadius: "8px",
    outline: "none",
    resize: "vertical",
    fontFamily: "ui-monospace, monospace",
    background: "#fafafa",
  },
  button: {
    padding: "10px 12px",
    fontSize: "15px",
    fontWeight: 600,
    color: "#fff",
    background: "#2563eb",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  divider: { border: "none", borderTop: "1px solid #e4e4e7", margin: "20px 0" },
  message: { margin: 0, fontSize: "14px", textAlign: "center" },
};