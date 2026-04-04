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
        border: '1px solid var(--bg-border)',
        background: 'var(--bg-surface)',
        fontSize: 12,
        color: 'var(--text-secondary)',
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
        border: '1px solid var(--bg-border)',
        background: active ? 'rgba(255,255,255,0.15)' : 'var(--bg-surface)',
        display: 'flex',
        alignItems: 'center',
        padding: 2,
        cursor: 'pointer',
        transition: 'background 0.2s ease',
      }}
    >
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: active ? 'var(--text-primary)' : 'var(--text-muted)',
          transform: active ? 'translateX(16px)' : 'translateX(0)',
          transition: 'all 0.2s ease'
        }}
      />
    </button>
  );
}

function Row({ icon, label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', minWidth: 120 }}>
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
        border: '1px solid var(--bg-border)',
        borderRadius: 16,
        overflow: 'hidden',
        background: 'var(--bg-surface)',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
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
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'var(--text-primary)', color: 'var(--bg-dark)',
            display: 'grid', placeItems: 'center',
          }}>
            <CalendarMonthIcon fontSize="small" />
          </div>
          <div style={{ textAlign: 'left', minWidth: 0 }}>
            <div style={{
              fontWeight: 700, color: 'var(--text-primary)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              fontFamily: 'var(--font-heading)', fontSize: 14,
            }}>{title}</div>
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
                style={{
                  width: 24, height: 24, borderRadius: '50%',
                  border: '2px solid var(--bg-elevated)', marginLeft: -6,
                }}
              />
            ))}
          </div>
          <span style={{
            width: 28, height: 28, borderRadius: 8,
            border: '1px solid var(--bg-border)',
            display: 'grid', placeItems: 'center',
            color: 'var(--text-muted)',
          }}>
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </span>
        </div>
      </button>

      {expanded && (
        <div style={{ borderTop: '1px solid var(--bg-border)', padding: 14, display: 'grid', gap: 12 }}>
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

          <div style={{ borderTop: '1px solid var(--bg-border)', paddingTop: 10 }}>
            <div style={{
              fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
              marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>Participants</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {participants.map((p) => (
                <div key={p.name} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '4px 8px',
                  border: '1px solid var(--bg-border)',
                  borderRadius: 999,
                }}>
                  <img src={p.avatar} alt={p.name} style={{ width: 20, height: 20, borderRadius: '50%' }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--bg-border)', paddingTop: 10 }}>
            <div style={{
              fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
              marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>Description</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{description}</div>
          </div>

          <div style={{
            borderTop: '1px solid var(--bg-border)', paddingTop: 10,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            gap: 8, flexWrap: 'wrap',
          }}>
          </div>
        </div>
      )}
    </div>
  );
}
