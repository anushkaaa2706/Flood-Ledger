
import { useState } from 'react';

type TaskStatus = 'Pending' | 'In progress' | 'Completed';
type TaskPriority = 'High' | 'Medium' | 'Low';

interface Task {
  id: string;
  action: string;
  ward: string;
  assignedTo: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  completedAt?: string;
}

const STORAGE_KEY = 'flood-ledger-preparedness-tasks';

const INITIAL_TASKS: Task[] = [
  {
    id: 'prep-1',
    action: 'Check drain clearance in flood-prone streets',
    ward: 'Bhandup West',
    assignedTo: 'Ward Operations Team',
    dueDate: '2026-10-27',
    priority: 'High',
    status: 'Pending',
  },
  {
    id: 'prep-2',
    action: 'Confirm emergency supply inventory',
    ward: 'Chembur',
    assignedTo: 'Relief Coordinator',
    dueDate: '2026-10-28',
    priority: 'High',
    status: 'In progress',
  },
  {
    id: 'prep-3',
    action: 'Review local evacuation contact list',
    ward: 'Mulund East',
    assignedTo: 'Field Officer',
    dueDate: '2026-10-29',
    priority: 'Medium',
    status: 'Pending',
  },
];

function loadTasks(): Task[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as Task[];
  } catch {
    // Fall back to sample tasks if saved data cannot be read.
  }
  return INITIAL_TASKS;
}

function todayString(): string {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

function formatDate(value: string): string {
  if (!value) return 'No due date';
  return new Date(`${value}T12:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function PreparednessPage() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [showForm, setShowForm] = useState(false);
  const [action, setAction] = useState('');
  const [ward, setWard] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState(todayString());
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [filter, setFilter] = useState<'All' | TaskStatus>('All');
  const [error, setError] = useState('');

  function saveTasks(next: Task[]) {
    setTasks(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      setError('Changes are visible, but browser storage was unavailable.');
    }
  }

  function addTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const newTask: Task = {
      id: `task-${Date.now()}`,
      action: action.trim(),
      ward: ward.trim(),
      assignedTo: assignedTo.trim(),
      dueDate,
      priority,
      status: 'Pending',
    };

    saveTasks([newTask, ...tasks]);
    setAction('');
    setWard('');
    setAssignedTo('');
    setDueDate(todayString());
    setPriority('Medium');
    setShowForm(false);
  }

  function updateStatus(task: Task, status: TaskStatus) {
    const updated = tasks.map((item) =>
      item.id === task.id
        ? {
            ...item,
            status,
            completedAt:
              status === 'Completed'
                ? new Date().toISOString()
                : undefined,
          }
        : item
    );
    saveTasks(updated);
    setError('');
  }

  const visibleTasks = tasks.filter(
    (task) => filter === 'All' || task.status === filter
  );

  const completed = tasks.filter((task) => task.status === 'Completed').length;
  const inProgress = tasks.filter((task) => task.status === 'In progress').length;
  const pending = tasks.filter((task) => task.status === 'Pending').length;

  return (
    <div className="prep-page">
      <div className="prep-intro">
        <div>
          <div className="prep-eyebrow">OPERATIONS / BEFORE FLOOD</div>
          <h1>Preparedness register</h1>
          <p>Assign, track, and complete actions before conditions deteriorate.</p>
        </div>
        <button
          className="prep-primary-button"
          onClick={() => {
            setShowForm(!showForm);
            setError('');
          }}
        >
          {showForm ? 'Cancel' : '+ Add task'}
        </button>
      </div>

      

      <div className="prep-stats">
        <div className="prep-stat">
          <span className="prep-stat-label">TOTAL ACTIONS</span>
          <strong>{tasks.length}</strong>
        </div>
        <div className="prep-stat">
          <span className="prep-stat-label">PENDING</span>
          <strong>{pending}</strong>
        </div>
        <div className="prep-stat">
          <span className="prep-stat-label">IN PROGRESS</span>
          <strong>{inProgress}</strong>
        </div>
        <div className="prep-stat">
          <span className="prep-stat-label">COMPLETED</span>
          <strong>{completed}</strong>
        </div>
      </div>

      {showForm && (
        <form className="prep-form" onSubmit={addTask}>
          <div className="prep-form-heading">Register a preparedness action</div>

          <label className="prep-field prep-field-wide">
            Action required
            <input
              value={action}
              onChange={(event) => setAction(event.target.value)}
              placeholder="e.g. Inspect storm-water drains"
              required
            />
          </label>

          <label className="prep-field">
            Ward / area
            <input
              value={ward}
              onChange={(event) => setWard(event.target.value)}
              placeholder="Enter ward or area"
              required
            />
          </label>

          <label className="prep-field">
            Assigned officer / team
            <input
              value={assignedTo}
              onChange={(event) => setAssignedTo(event.target.value)}
              placeholder="Enter officer or team"
              required
            />
          </label>

          <label className="prep-field">
            Due date
            <input
              type="date"
              value={dueDate}
              min={todayString()}
              onChange={(event) => setDueDate(event.target.value)}
              required
            />
          </label>

          <label className="prep-field">
            Priority
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as TaskPriority)}
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </label>

          <div className="prep-form-actions">
            <button type="button" className="prep-secondary-button" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button type="submit" className="prep-primary-button">
              Save task
            </button>
          </div>
        </form>
      )}

      {error && <p className="prep-error">{error}</p>}

      <div className="prep-register">
        <div className="prep-register-header">
          <div>
            <h2>Action register</h2>
            <p>{visibleTasks.length} actions shown</p>
          </div>
          <label className="prep-filter">
            <span>STATUS</span>
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value as typeof filter)}
            >
              <option>All</option>
              <option>Pending</option>
              <option>In progress</option>
              <option>Completed</option>
            </select>
          </label>
        </div>

        <div className="prep-table-scroll">
          <table className="prep-table">
            <thead>
              <tr>
                <th>Action / ward</th>
                <th>Assigned to</th>
                <th>Due date</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleTasks.map((task) => (
                <tr key={task.id}>
                  <td>
                    <div className={`prep-task-name ${task.status === 'Completed' ? 'is-completed' : ''}`}>
                      {task.action}
                    </div>
                    <div className="prep-task-ward">{task.ward}</div>
                    {task.completedAt && (
                      <div className="prep-completed-time">
                        Completed {new Date(task.completedAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    )}
                  </td>
                  <td>{task.assignedTo}</td>
                  <td>{formatDate(task.dueDate)}</td>
                  <td>
                    <span className={`prep-priority prep-priority-${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td>
                    <select
                      className={`prep-status prep-status-${task.status.toLowerCase().replace(' ', '-')}`}
                      value={task.status}
                      aria-label={`Status for ${task.action}`}
                      onChange={(event) => updateStatus(task, event.target.value as TaskStatus)}
                    >
                      <option>Pending</option>
                      <option>In progress</option>
                      <option>Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
              {visibleTasks.length === 0 && (
                <tr>
                  <td colSpan={5} className="prep-empty">
                    No actions match this status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
