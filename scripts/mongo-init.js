db = db.getSiblingDB("customerdb");

db.createUser({
  user: "data-agent-readonly",
  pwd: "data-agent-readonly-password",
  roles: [{ role: "read", db: "customerdb" }],
});

db.customers.insertMany([
  { name: "Ada", status: "active", plan: "pro", revenue: 120 },
  { name: "Grace", status: "active", plan: "team", revenue: 240 },
  { name: "Linus", status: "inactive", plan: "free", revenue: 0 },
]);