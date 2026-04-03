import React, { useState } from 'react';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LinkIcon from '@mui/icons-material/Link';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import VideocamIcon from '@mui/icons-material/Videocam';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function Pill({ children }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 999,
        border: '1px solid rgba(0,0,0,0.08)',
        background: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        color: '#374151',
        whiteSpace: 'nowrap'
      }}
    >
      {children}
    </span>
  );
}

function Toggle({ active, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!active)}
      style={{
        width: 38,
        height: 22,
        borderRadius: 999,
        border: '1px solid rgba(0,0,0,0.08)',
        background: active ? 'rgba(34,197,94,0.2)' : 'rgba(156,163,175,0.2)',
        display: 'flex',
        alignItems: 'center',
        padding: 2,
        cursor: 'pointer'
      }}
    >
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: active ? '#22c55e' : '#9ca3af',
          transform: active ? 'translateX(16px)' : 'translateX(0)',
          transition: 'transform 0.2s ease'
        }}
      />
    </button>
  );
}

function Row({ icon, label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b7280', minWidth: 120 }}>
        {icon}
        <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 6 }}>{children}</div>
    </div>
  );
}

export default function MeetingCard({
  title,
  date,
  time,
  duration,
  meetingLink,
  notification,
  participants,
  description
}) {
  const [expanded, setExpanded] = useState(true);
  const [isRecording, setIsRecording] = useState(true);
  const [isAiEnabled, setIsAiEnabled] = useState(true);

  return (
    <div
      style={{
        border: '1px solid var(--border-color)',
        borderRadius: 16,
        overflow: 'hidden',
        background: 'var(--surface-elevated)',
        boxShadow: 'var(--shadow-soft)'
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        style={{
          width: '100%',
          border: 'none',
          background: 'transparent',
          padding: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: '#BB89FA', color: '#fff', display: 'grid', placeItems: 'center' }}>
            <CalendarMonthIcon fontSize="small" />
          </div>
          <div style={{ textAlign: 'left', minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Today, {time}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', marginRight: 4 }}>
            {participants.slice(0, 3).map((p) => (
              <img
                key={p.name}
                src={p.avatar}
                alt={p.name}
                style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #fff', marginLeft: -6 }}
              />
            ))}
          </div>
          <span style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border-color)', display: 'grid', placeItems: 'center', color: 'var(--text-muted)' }}>
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </span>
        </div>
      </button>

      {expanded && (
        <div style={{ borderTop: '1px solid var(--border-color)', padding: 14, display: 'grid', gap: 12 }}>
          <Row icon={<CalendarMonthIcon sx={{ fontSize: 15 }} />} label="Date">
            <Pill>{date}</Pill>
          </Row>

          <Row icon={<AccessTimeIcon sx={{ fontSize: 15 }} />} label="Time">
            <Pill>{time}</Pill>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>to</span>
            <Pill>{duration}</Pill>
          </Row>

          <Row icon={<VideocamIcon sx={{ fontSize: 15 }} />} label="Link">
            <Pill>
              <LinkIcon sx={{ fontSize: 12 }} />
              <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>{meetingLink}</span>
            </Pill>
          </Row>

          <Row icon={<NotificationsActiveIcon sx={{ fontSize: 15 }} />} label="Notification">
            <Pill>{notification}</Pill>
          </Row>

          <Row icon={<VideocamIcon sx={{ fontSize: 15 }} />} label="Recording">
            <Toggle active={isRecording} onChange={setIsRecording} />
          </Row>

          <Row icon={<AutoAwesomeIcon sx={{ fontSize: 15 }} />} label="AI notetaking">
            <Toggle active={isAiEnabled} onChange={setIsAiEnabled} />
          </Row>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Participants</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {participants.map((p) => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', border: '1px solid var(--border-color)', borderRadius: 999 }}>
                  <img src={p.avatar} alt={p.name} style={{ width: 20, height: 20, borderRadius: '50%' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Description</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{description}</div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {/* <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Going?</span> */}
            {/* <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {['Yes', 'No', 'Maybe'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  style={{
                    border: '1px solid var(--border-color)',
                    background: 'var(--surface-elevated)',
                    borderRadius: 999,
                    padding: '4px 10px',
                    fontSize: 12,
                    cursor: 'pointer',
                    color: 'var(--text-primary)'
                  }}
                >
                  {opt}
                </button>
              ))}
              <MoreHorizIcon sx={{ color: 'var(--text-muted)', fontSize: 18 }} />
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
}
