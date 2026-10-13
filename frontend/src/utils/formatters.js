/**
 * Format date string into friendly localized format (e.g., Oct 15, 2026)
 */
export const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

/**
 * Format date to HTML input YYYY-MM-DD
 */
export const toInputDateFormat = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Check if a due date is overdue compared to current date
 */
export const isOverdue = (dueDate, status) => {
  if (status === 'completed' || !dueDate) return false;
  const due = new Date(dueDate);
  const now = new Date();
  // Due date midnight comparison
  due.setHours(23, 59, 59, 999);
  return due < now;
};

/**
 * Category color token badge metadata
 */
export const CATEGORY_META = {
  Programming: {
    label: 'Programming',
    color: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  'Web Development': {
    label: 'Web Development',
    color: '#06b6d4',
    bgColor: 'rgba(6, 182, 212, 0.15)',
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  'Computer Science': {
    label: 'Computer Science',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  Communication: {
    label: 'Communication',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  Other: {
    label: 'Other',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
};

export const GOAL_CATEGORIES = [
  'Programming',
  'Web Development',
  'Computer Science',
  'Communication',
  'Other',
];
