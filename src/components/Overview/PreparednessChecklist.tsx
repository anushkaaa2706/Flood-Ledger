// ─── Overview: Preparedness Checklist ────────────────────────────────────────
// Officers can mark preparedness actions as complete. State is local to the
// session; a real backend would persist completions with timestamps.

import { useState } from 'react';
import type { ChecklistItem } from '../../types';
import { SampleDataBadge } from '../shared/SampleDataBadge';

interface Props {
  items: ChecklistItem[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function PreparednessChecklist({ items }: Props) {
  // Local state: track which items are toggled completed
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    () => new Set(items.filter((i) => i.completed).map((i) => i.id))
  );

  const completedCount = completedIds.size;
  const totalCount     = items.length;

  function toggle(id: string) {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="checklist-panel" role="region" aria-label="Preparedness checklist">
      <div className="checklist-panel-header">
        <span className="section-title">Preparedness Checklist</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SampleDataBadge />
          <span className="checklist-progress">
            {completedCount}/{totalCount} done
          </span>
        </div>
      </div>

      <ul className="checklist-list">
        {items.map((item) => {
          const isDone = completedIds.has(item.id);
          return (
            <li key={item.id} className="checklist-item">
              {/* Checkbox */}
              <button
                className={`checklist-checkbox${isDone ? ' checked' : ''}`}
                onClick={() => toggle(item.id)}
                aria-label={`Mark "${item.action}" as ${isDone ? 'incomplete' : 'complete'}`}
                aria-pressed={isDone}
              >
                {isDone && <span className="checklist-check-mark">✓</span>}
              </button>

              {/* Content */}
              <div className="checklist-item-body">
                <div className={`checklist-item-action${isDone ? ' done' : ''}`}>
                  {item.action}
                </div>
                <div className="checklist-item-meta">
                  <span>{item.assignedTo}</span>
                  {isDone && item.completedAt ? (
                    <span className="checklist-meta-pill done">
                      Done {formatDateTime(item.completedAt)}
                    </span>
                  ) : (
                    <span className="checklist-meta-pill due">
                      Due {formatDate(item.dueDate)}
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
