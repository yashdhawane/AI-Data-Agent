"use client";

import { useEffect, useState, type FormEvent } from "react";
import styles from "../page.module.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
type User = { id: string; email: string; name?: string | null; organizationId: string; role: "ADMIN" | "MEMBER" };
type DataSource = { id: string; name: string; type: string; createdAt: string };
type Member = { id: string; email: string; name: string | null; role: "ADMIN" | "MEMBER"; createdAt: string };
type BusinessContext = { id?: string; content: string; createdAt?: string; updatedAt?: string } | null;
type Metadata = { metadata?: { tables: { schema: string; name: string }[]; columns: { schema: string; table: string; name: string; dataType: string; nullable: boolean }[]; primaryKeys: { schema: string; table: string; columns: string[] }[]; foreignKeys: unknown[] } | { collections: { name: string; documentCount: number; fields: { name: string; dataTypes: string[]; nullable: boolean }[] }[]; columns: never[] } };
type AgentInsight = {
  summary: string;
  facts: string[];
  inferences: string[];
  recommendations: string[];
  unknowns: string[];
  confidence: "LOW" | "MEDIUM" | "HIGH";
};
type AgentResult = {
  question: string;
  sql: string;
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  insight: AgentInsight;
};
type Tab = "overview" | "members" | "sources" | "context" | "schema" | "query";

async function api(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? "Request failed");
  }
  return response.status === 204 ? null : response.json();
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [selectedSource, setSelectedSource] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [queryMode, setQueryMode] = useState<"agent" | "sql">("agent");
  const [sql, setSql] = useState("");
  const [notice, setNotice] = useState("");
  const [sourceForm, setSourceForm] = useState({
    name: "",
    type: "postgresql",
    hostedBy: "docker",
    host: "127.0.0.1",
    port: "5433",
    database: "customerdb",
    username: "agent",
    password: "",
  });
  const [memberForm, setMemberForm] = useState({ email: "", name: "", password: "" });
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AgentResult | null>(null);
  const [businessContext, setBusinessContext] = useState<BusinessContext>(null);
  const [contextDraft, setContextDraft] = useState("");

  useEffect(() => {
    api("/auth/me")
      .then((data) => { setUser(data.user); return Promise.all([api("/data-sources"), api("/users"), api("/business-context")]); })
      .then(([sources, users, context]) => { setDataSources(sources); setSelectedSource(sources[0]?.id ?? ""); setMembers(users); setBusinessContext(context); setContextDraft(context?.content ?? ""); })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const data = await api(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify({ email, password, name, organizationName }),
      });
      setUser(data.user);
      const [sources, users, context] = await Promise.all([api("/data-sources"), api("/users"), api("/business-context")]);
      setDataSources(sources); setSelectedSource(sources[0]?.id ?? ""); setMembers(users); setBusinessContext(context); setContextDraft(context?.content ?? "");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Request failed");
    }
  }

  async function signOut() {
    await api("/auth/logout", { method: "POST" });
    setUser(null);
  }

  async function addSource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setNotice("");
    const connectionUrl = sourceForm.type === "mongodb"
      ? `mongodb://${encodeURIComponent(sourceForm.username)}:${encodeURIComponent(sourceForm.password)}@${sourceForm.host}:${sourceForm.port}/${encodeURIComponent(sourceForm.database)}`
      : `postgresql://${encodeURIComponent(sourceForm.username)}:${encodeURIComponent(sourceForm.password)}@${sourceForm.host}:${sourceForm.port}/${encodeURIComponent(sourceForm.database)}?sslmode=disable`;
    try { const source = await api("/data-sources", { method: "POST", body: JSON.stringify({ name: sourceForm.name, type: sourceForm.type, connectionUrl }) }); setDataSources((current) => [source, ...current]); setSelectedSource(source.id); setSourceForm({ name: "", type: "postgresql", hostedBy: "docker", host: "127.0.0.1", port: "5433", database: "customerdb", username: "agent", password: "" }); setNotice("PostgreSQL source added."); }
    catch (requestError) { setNotice(requestError instanceof Error ? requestError.message : "Could not add source"); }
  }

  async function testSource() {
    if (!selectedSource) return; setNotice("");
    try { await api(`/data-sources/${selectedSource}/test-connection`, { method: "POST" }); setNotice("Connection verified."); }
    catch (requestError) { setNotice(requestError instanceof Error ? requestError.message : "Connection failed"); }
  }

  async function removeSource(sourceId: string) {
    setNotice("");
    try {
      await api(`/data-sources/${sourceId}`, { method: "DELETE" });
      const sources = await api("/data-sources");
      setDataSources(sources);
      setSelectedSource(sources[0]?.id ?? "");
      setNotice("Connection removed.");
    } catch (requestError) {
      setNotice(requestError instanceof Error ? requestError.message : "Could not remove connection");
    }
  }

  async function addMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setNotice("");
    try { const member = await api("/users", { method: "POST", body: JSON.stringify(memberForm) }); setMembers((current) => [...current, member]); setMemberForm({ email: "", name: "", password: "" }); setNotice("Member added to your organization."); }
    catch (requestError) { setNotice(requestError instanceof Error ? requestError.message : "Could not add member"); }
  }

  async function saveBusinessContext(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setNotice("");
    try {
      const context = await api("/business-context", { method: "PUT", body: JSON.stringify({ content: contextDraft }) });
      setBusinessContext(context); setContextDraft(context.content); setNotice("Business context saved.");
    } catch (requestError) { setNotice(requestError instanceof Error ? requestError.message : "Could not save business context"); }
  }

  async function askAgent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setNotice(""); setResult(null);
    try { setResult(await api(queryMode === "agent" ? "/agent/query" : "/query", { method: "POST", body: JSON.stringify(queryMode === "agent" ? { dataSourceId: selectedSource, question } : { dataSourceId: selectedSource, sql }) }));
    } catch (requestError) { setNotice(requestError instanceof Error ? requestError.message : "Could not run query"); }
  }

  async function loadMetadata() {
    if (!selectedSource) return;
    setNotice("");
    try { setMetadata(await api(`/data-sources/${selectedSource}/metadata`)); }
    catch (requestError) { setNotice(requestError instanceof Error ? requestError.message : "Could not load schema"); }
  }

  if (loading) return <main className={styles.page}><p className={styles.loading}>Loading session...</p></main>;
  if (user) return <main className={styles.appShell}>
    <aside className={styles.sidebar}><div className={styles.brand}><span className={styles.brandMark}>◒</span><span>Data Agent</span></div><div className={styles.orgBlock}><span className={styles.orgDot} />{user.name ?? user.email}<small>{user.role} workspace</small></div><nav>{(["overview", "members", "sources", "context", "schema", "query"] as Tab[]).map((item) => ((item === "members" || item === "sources") && user.role !== "ADMIN") ? null : <button key={item} className={tab === item ? styles.navActive : ""} onClick={() => { setTab(item); if (item === "schema") void loadMetadata(); }}><span>{({ overview: "⌂", members: "◎", sources: "▣", context: "✎", schema: "◇", query: "✦" } as Record<Tab, string>)[item]}</span>{item === "overview" ? "Overview" : item === "members" ? "Members" : item === "sources" ? "Data sources" : item === "context" ? "Business context" : item === "schema" ? "Schema" : "Ask your data"}</button>)}</nav><button className={styles.signOut} onClick={signOut}>Sign out <span>↗</span></button></aside>
    <section className={styles.workspace}><header className={styles.topbar}><div><span className={styles.eyebrow}>SECURE WORKSPACE</span><p>{user.email}</p></div><div className={styles.avatar}>{(user.name ?? user.email).charAt(0).toUpperCase()}</div></header><div className={styles.content}>
      {tab === "overview" && <><div className={styles.pageHeading}><div><span className={styles.kicker}>YOUR WORKSPACE</span><h1>Good to see you{user.name ? `, ${user.name.split(" ")[0]}` : ""}.</h1><p className={styles.muted}>Connect your PostgreSQL data and ask questions in plain language.</p></div><button className={styles.primaryButton} onClick={() => setTab("query")}>Ask a question <span>→</span></button></div><div className={styles.metrics}><div><span>CONNECTED SOURCES</span><strong>{dataSources.length}</strong><small>PostgreSQL databases</small></div><div><span>ACCESS LEVEL</span><strong>{user.role}</strong><small>Organization permissions</small></div><div><span>QUERY ENGINE</span><strong>READY</strong><small>Read-only agent mode</small></div></div><div className={styles.splitGrid}><section className={styles.panel}><div className={styles.panelHeader}><div><span className={styles.kicker}>GET STARTED</span><h2>Build your data workspace</h2></div></div><div className={styles.steps}>{user.role === "ADMIN" && <button onClick={() => setTab("sources")}><b>01</b><span><strong>Connect PostgreSQL</strong><small>Add a secure database connection</small></span><i>→</i></button>}<button onClick={() => setTab("query")}><b>{user.role === "ADMIN" ? "02" : "01"}</b><span><strong>Ask your data</strong><small>Turn a question into a safe SQL query</small></span><i>→</i></button></div></section><section className={styles.panel + " " + styles.accentPanel}><span className={styles.kicker}>ACTIVE MODE</span><h2>Read-only intelligence</h2><p>Generated queries are validated and limited before they reach your database.</p><div className={styles.live}><span />Agent available</div></section></div></>}
      {tab === "context" && <div className={styles.pageHeading}><div><span className={styles.kicker}>SHARED KNOWLEDGE</span><h1>Tell the agent how your business works.</h1><p className={styles.muted}>Explain terms, metrics, policies, and rules that are not visible in your database schema.</p></div></div>}
      {tab === "context" && <section className={styles.contextLayout}><section className={styles.panel + " " + styles.formPanel}>{user.role === "ADMIN" ? <form onSubmit={saveBusinessContext}><label>Business context<textarea required minLength={1} value={contextDraft} onChange={(event) => setContextDraft(event.target.value)} placeholder="Revenue excludes refunds. Active customers have placed an order in the last 90 days. Use USD for all monetary values." rows={12} /></label><button className={styles.primaryButton} type="submit">Save context <span>→</span></button></form> : <><div className={styles.panelHeader}><div><span className={styles.kicker}>READ ONLY</span><h2>Organization context</h2></div></div><p className={styles.contextText}>{businessContext?.content ?? "Your organization has not added business context yet."}</p></>}</section><section className={styles.panel + " " + styles.accentPanel}><span className={styles.kicker}>USED IN ANALYSIS</span><h2>More useful answers</h2><p>The agent combines this shared knowledge with the live schema and data from your connected client database.</p><div className={styles.live}><span />{businessContext ? "Context active" : "Waiting for context"}</div></section></section>}
      {tab === "members" && <div className={styles.pageHeading}><div><span className={styles.kicker}>ORGANIZATION ADMIN</span><h1>Manage members.</h1><p className={styles.muted}>Add teammates to this organization with member access.</p></div></div>}
      {tab === "members" && <section className={styles.memberLayout}><section className={styles.panel + " " + styles.formPanel}><form onSubmit={addMember}><label>Member name<input required value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} placeholder="Jordan Lee" /></label><label>Email address<input required type="email" value={memberForm.email} onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })} placeholder="jordan@company.com" /></label><label>Temporary password<input required minLength={8} type="password" value={memberForm.password} onChange={(e) => setMemberForm({ ...memberForm, password: e.target.value })} placeholder="At least 8 characters" /></label><button className={styles.primaryButton} type="submit">Add member <span>→</span></button></form></section><section className={styles.panel}><div className={styles.panelHeader}><h2>Organization members</h2><span className={styles.count}>{members.length}</span></div>{members.map((member) => <div className={styles.memberRow} key={member.id}><span className={styles.avatarSmall}>{(member.name ?? member.email).charAt(0).toUpperCase()}</span><span><strong>{member.name ?? member.email}</strong><small>{member.email}</small></span><b>{member.role}</b></div>)}</section></section>}
      {tab === "sources" && user.role === "ADMIN" && <><div className={styles.pageHeading}><div><span className={styles.kicker}>DATA CONNECTIONS</span><h1>Connect a database.</h1><p className={styles.muted}>Choose where your database lives, then add its connection details.</p></div></div><div className={styles.sourceLayout}><section className={styles.panel + " " + styles.formPanel}><div className={styles.formSection}><span className={styles.stepNumber}>01</span><div><h2>Choose your database</h2><p className={styles.helper}>More connectors can be enabled as they become available.</p></div></div><label>Database type<select value={sourceForm.type} onChange={(e) => setSourceForm({ ...sourceForm, type: e.target.value })}><option value="postgresql">PostgreSQL</option><option value="mysql">MySQL</option><option value="mongodb">MongoDB</option><option value="sqlserver">SQL Server</option><option value="oracle">Oracle</option></select></label><div className={styles.databaseChoices}>{["postgresql", "mysql", "mongodb", "sqlserver", "oracle"].map((type) => <button type="button" key={type} className={sourceForm.type === type ? styles.databaseChoiceActive : styles.databaseChoice} onClick={() => setSourceForm({ ...sourceForm, type })}><span className={styles.databaseIcon}>▣</span>{type === "sqlserver" ? "SQL Server" : type.charAt(0).toUpperCase() + type.slice(1)}</button>)}</div><div className={styles.formSection}><span className={styles.stepNumber}>02</span><div><h2>Where is your database hosted?</h2><p className={styles.helper}>This helps us use the right network settings.</p></div></div><div className={styles.hostChoices}>{[{ value: "aws", label: "AWS", icon: "☁" }, { value: "google-cloud", label: "Google Cloud", icon: "◆" }, { value: "docker", label: "Docker", icon: "◈" }, { value: "other", label: "Other", icon: "＋" }].map((host) => <button type="button" key={host.value} className={sourceForm.hostedBy === host.value ? styles.hostChoiceActive : styles.hostChoice} onClick={() => setSourceForm({ ...sourceForm, hostedBy: host.value })}><span>{host.icon}</span>{host.label}</button>)}</div><div className={styles.formSection}><span className={styles.stepNumber}>03</span><div><h2>Connection details</h2><p className={styles.helper}>Your password is encrypted before it is stored.</p></div></div><form onSubmit={addSource} className={styles.connectionForm}><label>Connection name<input required value={sourceForm.name} onChange={(e) => setSourceForm({ ...sourceForm, name: e.target.value })} placeholder="Customer production DB" /></label><div className={styles.fieldGrid}><label>Host<input required value={sourceForm.host} onChange={(e) => setSourceForm({ ...sourceForm, host: e.target.value })} placeholder="127.0.0.1" /></label><label>Port<input required inputMode="numeric" value={sourceForm.port} onChange={(e) => setSourceForm({ ...sourceForm, port: e.target.value })} placeholder="5432" /></label></div><div className={styles.fieldGrid}><label>Database name<input required value={sourceForm.database} onChange={(e) => setSourceForm({ ...sourceForm, database: e.target.value })} placeholder="customerdb" /></label><label>Username<input required value={sourceForm.username} onChange={(e) => setSourceForm({ ...sourceForm, username: e.target.value })} placeholder="agent" /></label></div><label>Password<input required type="password" value={sourceForm.password} onChange={(e) => setSourceForm({ ...sourceForm, password: e.target.value })} placeholder="Database password" /></label><button className={styles.primaryButton} type="submit">Test and connect <span>→</span></button></form></section><section className={styles.panel}><div className={styles.panelHeader}><div><span className={styles.kicker}>CONNECTED</span><h2>Your data sources</h2></div><span className={styles.count}>{dataSources.length}</span></div>{dataSources.length === 0 ? <p className={styles.muted}>No sources connected yet.</p> : dataSources.map((source) => <div className={styles.sourceRow} key={source.id}><button onClick={() => setSelectedSource(source.id)}><span className={styles.databaseIcon}>▣</span><span><strong>{source.name}</strong><small>{source.type} · Connected</small></span>{selectedSource === source.id && <b>Selected</b>}</button><button className={styles.removeButton} onClick={() => void removeSource(source.id)}>Remove</button></div>)}{selectedSource && <button className={styles.secondaryButton} onClick={testSource}>Test selected connection</button>}</section></div></>}
      {tab === "schema" && <><div className={styles.pageHeading}><div><span className={styles.kicker}>DATABASE SCHEMA</span><h1>Inspect your schema.</h1><p className={styles.muted}>Live tables, collections, and fields available to the data agent.</p></div><button className={styles.secondaryButton} onClick={loadMetadata}>Refresh schema</button></div><section className={styles.panel}>{!metadata?.metadata ? <p className={styles.muted}>Select a source and load its schema.</p> : "tables" in metadata.metadata ? metadata.metadata.tables.map((table) => <div className={styles.tableRow} key={`${table.schema}.${table.name}`}><strong>{table.schema}.{table.name}</strong><span>{metadata.metadata?.columns.filter((column) => "schema" in column && column.schema === table.schema && column.table === table.name).map((column) => column.name).join("  ·  ")}</span></div>) : metadata.metadata.collections.map((collection) => <div className={styles.tableRow} key={collection.name}><strong>{collection.name}</strong><span>{collection.documentCount} documents · {collection.fields.map((field) => `${field.name} (${field.dataTypes.join("/")})`).join("  ·  ")}</span></div>)}</section></>}
      {tab === "query" && <><div className={styles.pageHeading}><div><span className={styles.kicker}>ASK YOUR DATA</span><h1>What would you like to know?</h1><p className={styles.muted}>Use the agent or run a read-only SQL query.</p></div></div><section className={styles.queryPanel}><div className={styles.modeSwitch}><button className={queryMode === "agent" ? styles.modeActive : ""} onClick={() => setQueryMode("agent")}>Agent question</button><button className={queryMode === "sql" ? styles.modeActive : ""} onClick={() => setQueryMode("sql")}>Direct SQL</button></div><label>Data source<select value={selectedSource} onChange={(e) => setSelectedSource(e.target.value)}><option value="">Select a PostgreSQL source</option>{dataSources.map((source) => <option key={source.id} value={source.id}>{source.name}</option>)}</select></label><form onSubmit={askAgent}><label>{queryMode === "agent" ? "Your question" : "Read-only SQL"}<textarea required value={queryMode === "agent" ? question : sql} onChange={(e) => queryMode === "agent" ? setQuestion(e.target.value) : setSql(e.target.value)} placeholder={queryMode === "agent" ? "How many customers signed up this month?" : "SELECT * FROM customers"} rows={4} /><button className={styles.primaryButton} type="submit" disabled={!selectedSource}>Run analysis <span>→</span></button></label></form></section>{result && <section className={styles.resultPanel}><div className={styles.panelHeader}><div><span className={styles.kicker}>RESULT</span><h2>{result.rowCount} rows returned</h2></div><span className={styles.confidenceBadge}>{result.insight.confidence}</span></div><div className={styles.aiInsight}><h3>AI summary</h3><p>{result.insight.summary}</p></div><div className={styles.insightGrid}><div className={styles.insightSection}><h4>Facts</h4><ul>{result.insight.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul></div><div className={styles.insightSection}><h4>Inferences</h4><ul>{result.insight.inferences.map((fact) => <li key={fact}>{fact}</li>)}</ul></div><div className={styles.insightSection}><h4>Recommendations</h4><ul>{result.insight.recommendations.map((fact) => <li key={fact}>{fact}</li>)}</ul></div><div className={styles.insightSection}><h4>Unknowns</h4><ul>{result.insight.unknowns.map((fact) => <li key={fact}>{fact}</li>)}</ul></div></div><pre>{result.sql}</pre><div className={styles.tableWrap}><table><thead><tr>{result.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{result.rows.map((row, index) => <tr key={index}>{result.columns.map((column) => <td key={column}>{String(row[column] ?? "-")}</td>)}</tr>)}</tbody></table></div></section>}</>}
      {notice && <p className={styles.notice}>{notice}</p>}
    </div></section>
  </main>;

  return <main className={styles.page}><section className={styles.authCard}>
    <div className={styles.eyebrow}>POSTGRESQL DATA AGENT</div>
    <h1>{mode === "login" ? "Welcome back." : "Create your workspace."}</h1>
    <p className={styles.muted}>{mode === "login" ? "Sign in to continue to your data workspace." : "Start asking useful questions of your data."}</p>
    <form onSubmit={submit}>
      {mode === "register" && <>
        <label>Name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ada Lovelace" /></label>
        <label>Organization<input required value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} placeholder="Acme Analytics" /></label>
      </>}
      <label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" /></label>
      <label>Password<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" /></label>
      {error && <p className={styles.error}>{error}</p>}
      <button className={styles.primaryButton} type="submit">{mode === "login" ? "Sign in" : "Create account"}</button>
    </form>
    <button className={styles.switchButton} onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
      {mode === "login" ? "Need an account? Register" : "Already have an account? Sign in"}
    </button>
  </section></main>;
}
