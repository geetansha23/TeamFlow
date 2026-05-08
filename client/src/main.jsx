import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import { CheckCircle2, Clock3, FolderKanban, LayoutDashboard, LogOut, Plus, Shield, Users } from "lucide-react";
import "./styles.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({ baseURL: API });

function App() {
  const [token, setToken] = useState(localStorage.getItem("ttm_token") || "");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("ttm_user") || "null"));
  const [view, setView] = useState("dashboard");
  const [theme, setTheme] = useState(localStorage.getItem("ttm_theme") || "dark");

  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem("ttm_theme", theme);
  }, [theme]);

  useEffect(() => {
    api.interceptors.request.use((config) => {
      const saved = localStorage.getItem("ttm_token");
      if (saved) config.headers.Authorization = `Bearer ${saved}`;
      return config;
    });
  }, []);

  const logout = () => {
    localStorage.removeItem("ttm_token");
    localStorage.removeItem("ttm_user");
    setToken("");
    setUser(null);
  };

  const onAuth = ({ token, user }) => {
    localStorage.setItem("ttm_token", token);
    localStorage.setItem("ttm_user", JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  if (!token || !user) return <AuthScreen onAuth={onAuth} theme={theme} setTheme={setTheme} />;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><CheckCircle2 size={24} /></div>
          <div>
            <h2>TeamFlow</h2>
            <p>Task Manager</p>
          </div>
        </div>

        <nav>
          <button className={view === "dashboard" ? "active" : ""} onClick={() => setView("dashboard")}><LayoutDashboard size={18}/> Dashboard</button>
          <button className={view === "projects" ? "active" : ""} onClick={() => setView("projects")}><FolderKanban size={18}/> Projects</button>
          <button className={view === "tasks" ? "active" : ""} onClick={() => setView("tasks")}><Clock3 size={18}/> Tasks</button>
        </nav>

        <div className="profile-card">
          <div className="avatar">{user.name?.[0]?.toUpperCase()}</div>
          <div>
            <strong>{user.name}</strong>
            <span>{user.role}</span>
          </div>
        </div>

        <button className="ghost" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          Switch to {theme === "dark" ? "Light" : "Dark"}
        </button>
        <button className="logout" onClick={logout}><LogOut size={17}/> Logout</button>
      </aside>

      <main>
        <Header user={user} />
        {view === "dashboard" && <Dashboard />}
        {view === "projects" && <Projects user={user} />}
        {view === "tasks" && <Tasks user={user} />}
      </main>
    </div>
  );
}

function Header({ user }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Welcome back, {user.name}</p>
        <h1>Manage projects, tasks and team progress</h1>
      </div>
      <div className="role-badge"><Shield size={16}/> {user.role === "admin" ? "Admin Access" : "Member Access"}</div>
    </header>
  );
}

function AuthScreen({ onAuth, theme, setTheme }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/signup";
      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : form;

      const { data } = await api.post(endpoint, payload);
      onAuth(data);
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed");
    }
  };

  return (
    <div className="auth-page">
      <section className="hero-panel minimal-hero">
        <h1>TeamFlow</h1>
        <p>Plan together. Work better. Deliver more.</p>
      </section>

      <form className="auth-card" onSubmit={submit}>
        <button
          type="button"
          className="theme-btn"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>

        <h2>{mode === "login" ? "Welcome Back" : "Create Account"}</h2>
        <p>
          {mode === "signup"
            ? "Create your workspace and start collaborating."
            : "Login to continue to your workspace."}
        </p>

        {mode === "signup" && (
          <input
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        )}

        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {error && <div className="error">{error}</div>}

        <button className="primary">
          {mode === "login" ? "Login" : "Signup"}
        </button>

        <button
          type="button"
          className="link-btn"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login"
            ? "Need an account? Signup"
            : "Already registered? Login"}
        </button>
      </form>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get("/dashboard/stats").then(res => setStats(res.data)); }, []);

  if (!stats) return <div className="loader">Loading dashboard...</div>;

  const cards = [
    ["Projects", stats.totalProjects, <FolderKanban />],
    ["Total Tasks", stats.totalTasks, <CheckCircle2 />],
    ["In Progress", stats.inProgress, <Clock3 />],
    ["Overdue", stats.overdue, <Clock3 />],
  ];

  return (
    <section>
      <div className="stats-grid">
        {cards.map(([label, value, icon]) => (
          <div className="stat-card" key={label}>
            <div className="stat-icon">{icon}</div>
            <p>{label}</p>
            <h2>{value}</h2>
          </div>
        ))}
      </div>
      <div className="wide-card">
        <div>
          <p className="eyebrow">Completion rate</p>
          <h2>{stats.completionRate}% completed</h2>
          <p className="muted">Todo: {stats.todo} • In Progress: {stats.inProgress} • Completed: {stats.completed}</p>
        </div>
        <div className="progress-ring">
          <span>{stats.completionRate}%</span>
        </div>
      </div>
    </section>
  );
}

function Projects({ user }) {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });
  const [memberEmail, setMemberEmail] = useState({});
  const [message, setMessage] = useState("");

  const load = () => api.get("/projects").then(res => setProjects(res.data));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await api.post("/projects", form);
      setForm({ title: "", description: "" });
      load();
    } catch (err) { setMessage(err.response?.data?.message || "Could not create project"); }
  };

  const addMember = async (id) => {
    setMessage("");
    try {
      await api.patch(`/projects/${id}/members`, { email: memberEmail[id] });
      setMemberEmail({ ...memberEmail, [id]: "" });
      load();
    } catch (err) { setMessage(err.response?.data?.message || "Could not add member"); }
  };

  const remove = async (id) => {
    if (!confirm("Delete this project and all tasks?")) return;
    await api.delete(`/projects/${id}`);
    load();
  };

  return (
    <section className="content-grid">
      {user.role === "admin" && (
        <form className="panel" onSubmit={create}>
          <h2><Plus size={20}/> New Project</h2>
          <input placeholder="Project title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <button className="primary">Create Project</button>
          {message && <div className="error">{message}</div>}
        </form>
      )}

      <div className="list-panel">
        <h2><FolderKanban size={20}/> Projects</h2>
        {projects.map(project => (
          <div className="project-card" key={project._id}>
            <div>
              <h3>{project.title}</h3>
              <p>{project.description || "No description added."}</p>
              <div className="members"><Users size={15}/> {project.members?.map(m => m.name).join(", ")}</div>
            </div>
            {user.role === "admin" && (
              <div className="project-actions">
                <input placeholder="Member email" value={memberEmail[project._id] || ""} onChange={e => setMemberEmail({ ...memberEmail, [project._id]: e.target.value })} />
                <button onClick={() => addMember(project._id)}>Add</button>
                <button className="danger" onClick={() => remove(project._id)}>Delete</button>
              </div>
            )}
          </div>
        ))}
        {!projects.length && <p className="muted">No projects found.</p>}
      </div>
    </section>
  );
}

function Tasks({ user }) {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", project: "", assignedTo: "", dueDate: "", priority: "Medium" });
  const [error, setError] = useState("");

  const selectedProject = useMemo(() => projects.find(p => p._id === form.project), [projects, form.project]);

  const load = async () => {
    const [taskRes, projectRes] = await Promise.all([api.get("/tasks"), api.get("/projects")]);
    setTasks(taskRes.data);
    setProjects(projectRes.data);
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/tasks", form);
      setForm({ title: "", description: "", project: "", assignedTo: "", dueDate: "", priority: "Medium" });
      load();
    } catch (err) { setError(err.response?.data?.message || "Could not create task"); }
  };

  const updateStatus = async (id, status) => {
    await api.patch(`/tasks/${id}`, { status });
    load();
  };

  const remove = async (id) => {
    if (!confirm("Delete this task?")) return;
    await api.delete(`/tasks/${id}`);
    load();
  };

  return (
    <section className="content-grid">
      {user.role === "admin" && (
        <form className="panel" onSubmit={create}>
          <h2><Plus size={20}/> New Task</h2>
          <input placeholder="Task title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <select value={form.project} onChange={e => setForm({ ...form, project: e.target.value, assignedTo: "" })}>
            <option value="">Select project</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
          </select>
          <select value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}>
            <option value="">Assign to</option>
            {selectedProject?.members?.map(m => <option key={m._id} value={m._id}>{m.name} — {m.email}</option>)}
          </select>
          <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
            <option>Low</option><option>Medium</option><option>High</option>
          </select>
          <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
          <button className="primary">Create Task</button>
          {error && <div className="error">{error}</div>}
        </form>
      )}

      <div className="list-panel">
        <h2><CheckCircle2 size={20}/> Tasks</h2>
        {tasks.map(task => (
          <div className="task-card" key={task._id}>
            <div>
              <div className="task-head">
                <h3>{task.title}</h3>
                <span className={`priority ${task.priority}`}>{task.priority}</span>
              </div>
              <p>{task.description || "No description added."}</p>
              <p className="muted">Project: {task.project?.title} • Assigned: {task.assignedTo?.name} • Due: {new Date(task.dueDate).toLocaleDateString()}</p>
            </div>
            <div className="task-actions">
              <select value={task.status} onChange={e => updateStatus(task._id, e.target.value)}>
                <option>Todo</option><option>In Progress</option><option>Completed</option>
              </select>
              {user.role === "admin" && <button className="danger" onClick={() => remove(task._id)}>Delete</button>}
            </div>
          </div>
        ))}
        {!tasks.length && <p className="muted">No tasks found.</p>}
      </div>
    </section>
  );
}

createRoot(document.getElementById("root")).render(<App />);
