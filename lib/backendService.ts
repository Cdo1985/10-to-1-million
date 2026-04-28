export async function fetchLogs() {
  const res = await fetch("/api/tasks/logs");
  if (!res.ok) throw new Error("Failed to fetch logs");
  return res.json();
}

export async function simulateTask(taskType: string) {
  const res = await fetch("/api/tasks/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskType }),
  });
  if (!res.ok) throw new Error("Failed to simulate task");
  return res.json();
}
