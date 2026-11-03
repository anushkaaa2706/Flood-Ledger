
import { useEffect, useState } from 'react';

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

interface Props {
  canManageTasks: boolean;
}

const STORAGE_KEY = 'flood-ledger-preparedness-tasks';

function loadTasks(): Task[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      const parsed: unknown = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed as Task[];
      }
    }
  } catch {
    // Keep the Overview usable if browser storage cannot be read.
  }

  return [];
}
function formatDate(value: string): string {
  if (!value) return 'No due date';

  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return 'No due date';

  return date.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function PreparednessChecklist({ canManageTasks }: Props) {
 const [tasks, setTasks] = useState<Task[]>(() => loadTasks());

  useEffect(() => {
  function reloadTasks() {
    const latestTasks = loadTasks();
    setTasks(latestTasks);
  }

  reloadTasks();

  window.addEventListener('preparedness-tasks-updated', reloadTasks);
  window.addEventListener('storage', reloadTasks);

  return () => {
    window.removeEventListener(
      'preparedness-tasks-updated',
      reloadTasks
    );
    window.removeEventListener('storage', reloadTasks);
  };
}, []);

  function updateStatus(task: Task, status: TaskStatus) {
    if (!canManageTasks) return;

    const nextTasks = tasks.map((item) =>
      item.id === task.id
        ? {
            ...item,
            status,
            completedAt:
              status === 'Completed'
                ? item.status === 'Completed' && item.completedAt
                  ? item.completedAt
                  : new Date().toISOString()
                : undefined,
          }
        : item
    );

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTasks));
      setTasks(nextTasks);
      window.dispatchEvent(new Event('preparedness-tasks-updated'));
    } catch {
      // Do not show an update that failed to save.
    }
  }

  const completedCount = tasks.filter(
    (task) => task.status === 'Completed'
  ).length;

  return (
    <div
      className="checklist-panel"
      role="region"
      aria-label="Preparedness checklist"
    >
      <div className="checklist-panel-header">
        <span className="section-title">Preparedness Checklist</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="checklist-progress">
            {completedCount}/{tasks.length} done
          </span>
        </div>
      </div>

      {tasks.length === 0 ? (
        <p className="checklist-empty">
          No preparedness actions are registered yet.
        </p>
      ) : (
        <ul className="checklist-list">
          {tasks.map((task) => {
            const isDone = task.status === 'Completed';

            return (
              <li key={task.id} className="checklist-item">
                <button
                  type="button"
                  className={`checklist-checkbox${isDone ? ' checked' : ''}`}
                  onClick={() =>
                    updateStatus(
                      task,
                      isDone ? 'Pending' : 'Completed'
                    )
                  }
                  disabled={!canManageTasks}
                  aria-label={
                    canManageTasks
                      ? `Mark "${task.action}" as ${
                          isDone ? 'incomplete' : 'complete'
                        }`
                      : `${task.action}: ${task.status}`
                  }
                  aria-pressed={isDone}
                >
                  {isDone && (
                    <span className="checklist-check-mark">✓</span>
                  )}
                </button>

                <div className="checklist-item-body">
                  <div
                    className={`checklist-item-action${isDone ? ' done' : ''}`}
                  >
                    {task.action}
                  </div>

                  <div className="checklist-item-meta">
                    <span>{task.ward} · {task.assignedTo}</span>

                    {isDone && task.completedAt ? (
                      <span className="checklist-meta-pill done">
                        Done {formatDateTime(task.completedAt)}
                      </span>
                    ) : (
                      <span className="checklist-meta-pill due">
                        Due {formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>

                  <div className="checklist-item-meta">
                    <span>Status: {task.status}</span>
                    <span>Priority: {task.priority}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
