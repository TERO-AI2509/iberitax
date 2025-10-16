"use client";
import { useEffect, useState } from "react";
import { clientFetch } from "../../../lib/http/fetcher";

export default function FetchDocs() {
  const [pong, setPong] = useState<string>("…");
  useEffect(() => {
    clientFetch<{ pong: boolean }>("/api/public/ping")
      .then((d) => setPong(String(d.pong)))
      .catch(() => setPong("error"));
  }, []);
  return (
    <main style={{ padding: 24 }}>
      <h1>Fetching Helpers</h1>
      <section>
        <h2>Client</h2>
        <pre>clientFetch("/api/public/ping") → {pong}</pre>
      </section>
      <section>
        <h2>Server</h2>
        <pre>await serverFetch("/api/private/whoami")</pre>
      </section>
    </main>
  );
}
