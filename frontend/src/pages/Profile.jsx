import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, LogOut, ShieldCheck, Flame, Target, ListTodo, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatDate } from '../utils/formatters';
import ConfirmModal from '../components/ConfirmModal';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const fetchQuickStats = async () => {
      try {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const res = await api.get(`/dashboard/stats?timezone=${encodeURIComponent(timeZone)}`);
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.warn('Failed to load profile stats:', err.message);
      }
    };
    fetchQuickStats();
  }, []);

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Student Profile</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
          Your personal learning account and achievement statistics.
        </p>
      </div>

      {/* Profile Card */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
          background: 'linear-gradient(135deg, rgba(30, 41, 68, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '1px solid var(--border-medium)',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '2rem',
            fontWeight: 800,
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
          }}
        >
          {getInitials(user?.name)}
        </div>

        <div style={{ flex: 1, minWidth: '240px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{user?.name || 'Student'}</h2>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#6ee7b7',
              }}
            >
              Active Learner
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={15} color="var(--text-muted)" />
              <span>{user?.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={15} color="var(--text-muted)" />
              <span>Joined: {formatDate(user?.createdAt)}</span>
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="btn btn-outline"
            style={{ color: 'var(--accent-rose)', borderColor: 'rgba(244, 63, 94, 0.3)' }}
            id="profile-logout-btn"
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ color: 'var(--accent-amber)', display: 'inline-flex', marginBottom: '6px' }}>
            <Flame size={24} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {stats?.streak?.currentStreak || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Day Streak
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ color: 'var(--primary)', display: 'inline-flex', marginBottom: '6px' }}>
            <Target size={24} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {stats?.goals?.total || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Goals
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ color: 'var(--accent-emerald)', display: 'inline-flex', marginBottom: '6px' }}>
            <ListTodo size={24} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {stats?.tasks?.completed || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Tasks Completed
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ color: 'var(--accent-cyan)', display: 'inline-flex', marginBottom: '6px' }}>
            <Award size={24} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {stats?.tasks?.completionPercentage || 0}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Success Rate
          </div>
        </div>
      </div>

      {/* Account Security Information Banner */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
          <ShieldCheck size={20} color="var(--accent-emerald)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Security & Authentication</h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
          Your session is secured using JSON Web Tokens (JWT) with bcrypt-hashed credentials and HttpOnly cookie transmission.
          All learning records and task statistics are isolated strictly to your student account.
        </p>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        title="Confirm Log Out"
        message="Are you sure you want to log out of SkillSprint? You can sign back in at any time to resume tracking your goals."
        confirmText="Log Out"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutModal(false)}
        isLoading={isLoggingOut}
        isDangerous={false}
      />
    </div>
  );
};

export default Profile;
