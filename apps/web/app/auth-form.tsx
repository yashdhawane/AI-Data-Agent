"use client";

import { useState, type FormEvent } from "react";
import styles from "./page.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type AuthMode = "login" | "register";

export default function AuthForm({ mode }: { mode: AuthMode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/auth/${mode}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, organizationName }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? "Request failed");
      window.location.assign("/workspace");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Request failed");
      setSubmitting(false);
    }
  }

  const isLogin = mode === "login";

  return (
    <main className={styles.page}>
      <section className={styles.authCard}>
        <a className={styles.eyebrow} href="/">POSTGRESQL DATA AGENT</a>
        <h1>{isLogin ? "Welcome back." : "Create your workspace."}</h1>
        <p className={styles.muted}>
          {isLogin ? "Sign in to continue to your data workspace." : "Start asking useful questions of your data."}
        </p>
        <form onSubmit={submit}>
          {!isLogin && <>
            <label>Name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ada Lovelace" /></label>
            <label>Organization<input required value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} placeholder="Acme Analytics" /></label>
          </>}
          <label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" /></label>
          <label>Password<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /></label>
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.primaryButton} type="submit" disabled={submitting}>
            {submitting ? "Please wait..." : isLogin ? "Sign in" : "Create account"}
          </button>
        </form>
        <a className={styles.switchButton} href={isLogin ? "/signup" : "/signin"}>
          {isLogin ? "Need an account? Register" : "Already have an account? Sign in"}
        </a>
      </section>
    </main>
  );
}
