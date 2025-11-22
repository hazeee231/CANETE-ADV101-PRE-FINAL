import { useEffect, useState } from "react";

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function fmt(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch (e) {
    return "-";
  }
}

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("todo");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("todos:v1");
      if (raw) setTodos(JSON.parse(raw));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("todos:v1", JSON.stringify(todos));
    } catch (e) {
      console.error(e);
    }
  }, [todos]);

  function addTodo(e) {
    e.preventDefault();
    doAdd();
  }

  function doAdd() {
    const t = title.trim();
    if (!t) return;
    const now = Date.now();
    const item = { id: uid(), title: t, description: description.trim(), completed: false, createdAt: now, updatedAt: now };
    setTodos((s) => [item, ...s]);
    setTitle("");
    setDescription("");
  }

  function deleteTodo(id) {
    setTodos((s) => s.filter((it) => it.id !== id));
  }

  function toggleComplete(id) {
    const now = Date.now();
    setTodos((s) => s.map((it) => (it.id === id ? { ...it, completed: !it.completed, updatedAt: now } : it)));
  }

  function startEditing(item) {
    setEditingId(item.id);
    setEditingTitle(item.title);
    setEditingDescription(item.description || "");
  }

  function saveEdit(e) {
    e.preventDefault();
    const t = editingTitle.trim();
    if (!t) return;
    const now = Date.now();
    setTodos((s) => s.map((it) => (it.id === editingId ? { ...it, title: t, description: editingDescription.trim(), updatedAt: now } : it)));
    setEditingId(null);
    setEditingTitle("");
    setEditingDescription("");
  }

  const visible = todos.filter((it) => {
    if (tab === "todo" && it.completed) return false;
    if (tab === "completed" && !it.completed) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!(it.title.toLowerCase().includes(q) || (it.description || "").toLowerCase().includes(q))) return false;
    }
    return true;
  });

  return (
    <div className="page">
      <header className="header">
        <div className="brand">My Tasks</div>
        <nav className="nav">
          <button className={`nav-btn ${tab === "todo" ? "active" : ""}`} onClick={() => setTab("todo")}>To Do</button>
          <button className={`nav-btn ${tab === "completed" ? "active" : ""}`} onClick={() => setTab("completed")}>Completed</button>
        </nav>
        <div className="search-area">
          <input className="search" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </header>

      <main className="wrap">
        <section className="panel create">
          <h2 className="panel-title">Create Task</h2>
          <form className="form" onSubmit={addTodo}>
            <input
              className="field title"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); doAdd(); } }}
            />
            <textarea
              className="field desc"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doAdd(); } }}
            />
            <div className="form-actions">
              <button type="submit" className="primary">Add Task</button>
            </div>
          </form>
        </section>

        <section className="panel list">
          <h2 className="panel-title">{tab === "todo" ? "To Do" : "Completed"}</h2>

          {visible.length === 0 ? (
            <div className="empty">No tasks — add one using the form.</div>
          ) : (
            <div className="grid">
              {visible.map((it) => (
                <article key={it.id} className={`card ${it.completed ? "done" : ""}`}>
                  <div className="card-left">
                    <input type="checkbox" checked={it.completed} onChange={() => toggleComplete(it.id)} />
                  </div>
                  <div className="card-body">
                    {editingId === it.id ? (
                      <form onSubmit={saveEdit} className="edit">
                        <input className="field title" value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)} />
                        <textarea className="field desc" value={editingDescription} onChange={(e) => setEditingDescription(e.target.value)} />
                        <div className="card-actions">
                          <button className="primary small" onClick={saveEdit} type="button">Save</button>
                          <button className="ghost small" onClick={() => setEditingId(null)} type="button">Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <h3 className="card-title">{it.title}</h3>
                        {it.description ? <p className="card-desc">{it.description}</p> : null}
                        <div className="meta">Created: {fmt(it.createdAt)} · Updated: {fmt(it.updatedAt)}</div>
                      </>
                    )}
                  </div>
                  <div className="card-right">
                    {editingId !== it.id && (
                      <>
                        <button className="ghost small" onClick={() => startEditing(it)}>Edit</button>
                        <button className="danger small" onClick={() => deleteTodo(it.id)}>Delete</button>
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <style jsx>{`
        .page{--accent:#6366F1;--muted:#64748B;--bg-1:#f8fafc;--bg-2:#f1f5f9;min-height:100vh;background:linear-gradient(180deg,var(--bg-1),var(--bg-2));font-family:Inter,system-ui,Segoe UI,Roboto,'Helvetica Neue',Arial}
        .header{display:flex;align-items:center;gap:16px;padding:20px 28px;max-width:1100px;margin:18px auto}
        .brand{font-weight:700;font-size:20px;color:var(--accent)}
        .nav{display:flex;gap:8px}
        .nav-btn{background:transparent;border:0;padding:8px 12px;border-radius:8px;color:#334155;cursor:pointer;transition:all .15s ease}
        .nav-btn:hover{transform:translateY(-1px);filter:brightness(.98)}
        .nav-btn.active{background:var(--accent);color:#fff;box-shadow:0 6px 18px rgba(99,102,241,0.18)}
        .search-area{margin-left:auto}
        .search{padding:10px 12px;border-radius:10px;border:1px solid #e6edf3;min-width:220px;box-shadow:inset 0 1px 0 rgba(16,24,40,0.02)}

        .wrap{max-width:1100px;margin:0 auto;padding:12px 28px;display:grid;grid-template-columns:360px 1fr;gap:20px}
        .panel{background:white;border-radius:12px;padding:18px;box-shadow:0 8px 24px rgba(16,24,40,0.06);border:1px solid #eef2f6}
        .panel-title{margin:0 0 12px 0;font-size:16px;color:#0f172a}

        .form{display:flex;flex-direction:column;gap:10px}
        .field{padding:10px 12px;border-radius:8px;border:1px solid #e6edf3;background:#fff}
        .field.title{font-weight:600}
        .field.desc{min-height:80px;resize:vertical}
        .form-actions{display:flex;justify-content:flex-end}
        .primary{background:var(--accent);color:white;padding:10px 14px;border-radius:10px;border:0;cursor:pointer;box-shadow:0 8px 20px rgba(99,102,241,0.12);transition:transform .12s ease,box-shadow .12s ease}
        .primary:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(99,102,241,0.16)}
        .primary:focus{outline:2px solid rgba(99,102,241,0.18);outline-offset:3px}

        .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}
        .card{display:flex;gap:12px;align-items:flex-start;padding:14px;border-radius:12px;background:linear-gradient(180deg,#fff,#fbfdff);border:1px solid #edf2ff;transition:transform .12s ease,box-shadow .12s ease}
        .card:hover{transform:translateY(-6px);box-shadow:0 12px 30px rgba(16,24,40,0.06)}
        .card.done{opacity:0.85;background:linear-gradient(180deg,#f7f7fb,#f2fbf5);border-color:#e6f2ec}
        .card-left{display:flex;align-items:center}
        .card-body{flex:1}
        .card-title{margin:0;font-size:15px;color:#0f172a}
        .card-desc{margin:8px 0;color:#475569}
        .meta{font-size:12px;color:var(--muted)}
        .card-right{display:flex;flex-direction:column;gap:8px}
        .ghost{background:transparent;border:1px solid #e6edf3;padding:8px 10px;border-radius:8px;cursor:pointer}
        .danger{background:#fee2e2;border:0;padding:8px 10px;border-radius:8px;color:#b91c1c;cursor:pointer}
        .small{font-size:13px;padding:6px 8px}
        .empty{color:#475569;padding:18px}

        @media (max-width:880px){.wrap{grid-template-columns:1fr}.header{padding:12px}}
      `}</style>
    </div>
  );
}