import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  IconButton, 
  Tooltip, 
  Box,
  Typography,
  Drawer,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Button,
  Menu,
  MenuItem,
  Divider,
  Chip,
  TextField,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import VoiceOverOffIcon from '@mui/icons-material/VoiceOverOff';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import TranslateIcon from '@mui/icons-material/Translate';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import QuizIcon from '@mui/icons-material/Quiz';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { io } from 'socket.io-client';
import TranscriptionService from '../services/TranscriptionService';
import { supabase } from '../config/supabase';
import {
  buildMeetingIntelligence,
  classifyTranscriptLine,
  answerMeetingQuestion,
  getQuickPrompts
} from '../services/MeetingIntelligenceService';

/**
 * TranscriptionButton component for handling live speech-to-text transcription
 * 
 * @param {Object} props - Component props
 * @param {string} props.localUserId - The local user's ID
 * @param {string} props.localUserName - The local user's name
 * @param {string} props.meetingId - Current meeting ID
 * @param {boolean} props.micOn - Whether the microphone is enabled
 * @param {MediaStream} props.localStream - The local media stream
 * @param {Object} props.peerRefs - Reference to peer connections
 * @param {Function} props.onError - Error handler function
 */
function TranscriptionButton({ localUserId, localUserName, micOn, localStream, peerRefs, onError, meetingId }) {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [transcripts, setTranscripts] = useState([]);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [languageAnchorEl, setLanguageAnchorEl] = useState(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [exportAnchorEl, setExportAnchorEl] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [askQuery, setAskQuery] = useState('');
  const [askAnswer, setAskAnswer] = useState('Start with prompts like: What decisions were made? or Who is responsible for tasks?');
  const [approvedActions, setApprovedActions] = useState({});
  const [serverIntelligence, setServerIntelligence] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isWhisperActive, setIsWhisperActive] = useState(false);
  const [resumeAfterMicOn, setResumeAfterMicOn] = useState(false);
  
  // Socket reference for sharing transcription data
  const socketRef = useRef(null);
  const ownsSocketRef = useRef(false);

  // Initialize socket connection for transcription sharing
  useEffect(() => {
    const handleIncomingTranscription = (data) => {
      console.log('Received transcription data:', data);

      // Upsert remote chunks to support live interim caption updates.
      setTranscripts(prev => {
        const existingIndex = prev.findIndex(item =>
          item.id === data.id && item.speakerId === data.speakerId
        );

        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            ...data,
            isRemote: true,
            endTime: data.isFinal ? (data.endTime || new Date().toISOString()) : null,
          };
          return updated;
        }

        return [...prev, {
          ...data,
          isRemote: true,
          endTime: data.isFinal ? (data.endTime || new Date().toISOString()) : null,
        }];
      });
    };

    const attachSocketListener = (targetSocket) => {
      if (!targetSocket) return;
      targetSocket.off('transcription-data', handleIncomingTranscription);
      targetSocket.on('transcription-data', handleIncomingTranscription);
    };

    const detachSocketListener = (targetSocket) => {
      if (!targetSocket) return;
      targetSocket.off('transcription-data', handleIncomingTranscription);
    };

    // Get socket from parent component or create new one
    const getSocket = () => {
      // Try to get socket from window (passed from Meet component)
      if (window.meetingSocket) {
        ownsSocketRef.current = false;
        return window.meetingSocket;
      }
      
      // Create new socket connection if needed
      const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_LOCAL_API_URL || 'http://localhost:5000';
      ownsSocketRef.current = true;
      const fallbackSocket = io(API_BASE_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // Ensure fallback socket is in the room so transcription broadcasts work.
      fallbackSocket.on('connect', () => {
        if (meetingId) {
          fallbackSocket.emit('join-room', {
            meetingId,
            username: localUserName || 'Guest'
          });
        }
      });

      return fallbackSocket;
    };

    socketRef.current = getSocket();
    attachSocketListener(socketRef.current);

    // If the meeting socket appears after mount, switch to it so all clients share one channel.
    const socketMigrationInterval = setInterval(() => {
      if (!window.meetingSocket || window.meetingSocket === socketRef.current) return;

      const previousSocket = socketRef.current;
      detachSocketListener(previousSocket);

      socketRef.current = window.meetingSocket;
      ownsSocketRef.current = false;
      attachSocketListener(socketRef.current);

      if (previousSocket) {
        previousSocket.off('connect');
        previousSocket.off('transcription-data');
      }
    }, 1000);

    return () => {
      clearInterval(socketMigrationInterval);
      if (socketRef.current) {
        detachSocketListener(socketRef.current);
        if (ownsSocketRef.current) {
          socketRef.current.disconnect();
        }
      }
    };
  }, [meetingId, localUserName]);

  // Share transcription data with other users
  const shareTranscriptionData = (transcriptData) => {
    const emitSocket = window.meetingSocket && window.meetingSocket.connected
      ? window.meetingSocket
      : socketRef.current;

    if (emitSocket && emitSocket.connected && meetingId) {
      console.log('📤 Sharing transcription data:', {
        speakerId: transcriptData.speakerId,
        speakerName: transcriptData.speakerName,
        text: transcriptData.text?.substring(0, 50) + '...',
        isFinal: transcriptData.isFinal
      });
      
      emitSocket.emit('transcription-data', {
        ...transcriptData,
        meetingId,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('❌ Cannot share transcription - socket not connected or no meetingId', {
        socketConnected: socketRef.current?.connected,
        meetingId
      });
    }
  };
  const transcriptionServiceRef = useRef(new TranscriptionService());
  const lastSharedTranscriptsRef = useRef(new Map());
  const lastPersistedTranscriptsRef = useRef(new Map());
  const liveCursorRef = useRef(null);
  const pollCycleRef = useRef(0);
  const transcriptsEndRef = useRef(null);
  const savedTranscriptIdsRef = useRef(new Set());
  const insightsDebounceRef = useRef(null);
  const whisperRecorderRef = useRef(null);
  const whisperAudioContextRef = useRef(null);
  const whisperMixedStreamRef = useRef(null);
  const whisperNetworkWarnedRef = useRef(false);
  const insightApiUnavailableRef = useRef(false);
  const backendAiConfiguredRef = useRef(null);
  const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_LOCAL_API_URL || 'http://localhost:5000';
  const buildApiUrl = (path) => {
    const base = (API_BASE_URL || '').replace(/\/+$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    if (base.endsWith('/api') && normalizedPath.startsWith('/api/')) {
      return `${base}${normalizedPath.slice(4)}`;
    }

    return `${base}${normalizedPath}`;
  };

  const persistTranscriptDirectlyToSupabase = async (item) => {
    try {
      const row = {
        transcript_id: item.id,
        meeting_id: meetingId,
        user_id: item.speakerId || localUserId || null,
        speaker_name: item.speakerName || localUserName || 'Unknown',
        transcript_text: item.text,
        source: item.source || 'browser-stt',
        is_final: Boolean(item.isFinal),
        created_at: item.startTime || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: updatedRows, error: updateError } = await supabase
        .from('meeting_transcripts')
        .update({
          meeting_id: row.meeting_id,
          user_id: row.user_id,
          speaker_name: row.speaker_name,
          transcript_text: row.transcript_text,
          source: row.source,
          is_final: row.is_final,
          updated_at: row.updated_at,
        })
        .eq('transcript_id', row.transcript_id)
        .select('transcript_id');

      if (updateError) {
        throw updateError;
      }

      if (!updatedRows || updatedRows.length === 0) {
        const { error: insertError } = await supabase
          .from('meeting_transcripts')
          .insert(row);

        if (insertError) {
          throw insertError;
        }
      }
    } catch (error) {
      console.error('Direct Supabase transcript upsert failed:', error);
    }
  };
  const quickPrompts = useMemo(() => getQuickPrompts(), []);
  const intelligence = useMemo(() => buildMeetingIntelligence(transcripts), [transcripts]);
  const effectiveIntelligence = serverIntelligence || intelligence;
  const languageOptions = useMemo(() => {
    const serviceOptions = transcriptionServiceRef.current.supportedLanguages || [];
    const fallbackAutoOptions = [
      { code: 'auto-global', name: 'Auto (Multilingual)' },
      { code: 'auto-mix', name: 'Auto (Hindi + English)' }
    ];

    const merged = [...fallbackAutoOptions, ...serviceOptions];
    return merged.filter((item, index, list) =>
      list.findIndex(option => option.code === item.code) === index
    );
  }, []);
  
  // Check if speech recognition is supported
  const isSupported = transcriptionServiceRef.current.isSpeechRecognitionSupported();
  
  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (transcriptionServiceRef.current.isActive()) {
        transcriptionServiceRef.current.stopTranscription();
      }
      if (whisperRecorderRef.current && whisperRecorderRef.current.state !== 'inactive') {
        whisperRecorderRef.current.stop();
      }
    };
  }, []);
  
  // Build a stable local speaker identity for transcription sessions.
  const effectiveLocalUserId = localUserId || 'local-user';
  const effectiveLocalUserName = localUserName || 'You';

  // Prepare remote peers data if available
  const getRemotePeersData = () => {
    if (!peerRefs || !peerRefs.current) return [];

    return peerRefs.current
      .map(peer => {
        let peerStream = peer.stream;
        if (!peerStream && peer.peer) {
          peerStream = transcriptionServiceRef.current.getRemoteStreamFromPeer(peer.peer);
        }

        return {
          id: peer.id,
          username: peer.username || 'Remote User',
          stream: peerStream
        };
      })
      .filter(peer => peer.id && peer.stream);
  };

  const cleanupWhisperCaptureResources = () => {
    if (whisperMixedStreamRef.current) {
      whisperMixedStreamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (error) {
          console.error('Failed to stop whisper capture track:', error);
        }
      });
      whisperMixedStreamRef.current = null;
    }

    if (whisperAudioContextRef.current) {
      whisperAudioContextRef.current.close().catch(error => {
        console.error('Failed to close whisper audio context:', error);
      });
      whisperAudioContextRef.current = null;
    }
  };

  const buildWhisperCaptureStream = () => {
    if (!localStream) return null;

    const AudioContextImpl = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextImpl) {
      const audioTracks = localStream.getAudioTracks().filter(track => track.enabled);
      return audioTracks.length > 0 ? new MediaStream(audioTracks) : null;
    }

    const audioContext = new AudioContextImpl();
    const destination = audioContext.createMediaStreamDestination();
    const sourceStreams = [localStream];

    let connectedSources = 0;

    sourceStreams.forEach(stream => {
      const audioTracks = stream.getAudioTracks().filter(track => track.enabled && track.readyState === 'live');
      if (audioTracks.length === 0) return;

      try {
        const audioStream = new MediaStream(audioTracks);
        const sourceNode = audioContext.createMediaStreamSource(audioStream);
        sourceNode.connect(destination);
        connectedSources += 1;
      } catch (error) {
        console.error('Failed to attach stream to whisper mixer:', error);
      }
    });

    if (connectedSources === 0) {
      audioContext.close().catch(error => {
        console.error('Failed to close unused whisper audio context:', error);
      });
      return null;
    }

    whisperAudioContextRef.current = audioContext;
    whisperMixedStreamRef.current = destination.stream;
    return destination.stream;
  };

  const startTranscriptionSession = () => {
    // Check if microphone is enabled before starting transcription
    if (!micOn) {
      onError?.('Please turn on your microphone before starting transcription.');
      return false;
    }

    if (!localStream) {
      onError?.('Unable to access microphone stream. Please reload the page or check browser permissions.');
      return false;
    }

    const audioTracks = localStream.getAudioTracks();
    if (audioTracks.length === 0) {
      onError?.('No audio input detected. Please check if your microphone is properly connected.');
      return false;
    }

    if (!audioTracks.some(track => track.enabled)) {
      onError?.('Your microphone is currently muted. Please unmute it to use transcription.');
      return false;
    }

    const success = transcriptionServiceRef.current.startTranscription(
      effectiveLocalUserId,
      effectiveLocalUserName,
      (updatedTranscripts) => {
        setTranscripts([...updatedTranscripts]);

        // Stream interim and final updates whenever transcript content changes.
        updatedTranscripts.forEach(transcript => {
          if (!transcript?.id || !transcript?.text?.trim()) return;

          const signature = `${transcript.text.trim()}::${transcript.isFinal ? 'final' : 'interim'}`;
          const previousSignature = lastSharedTranscriptsRef.current.get(transcript.id);

          if (previousSignature !== signature) {
            lastSharedTranscriptsRef.current.set(transcript.id, signature);
            shareTranscriptionData(transcript);
          }
        });
      },
      (errorMessage) => {
        onError?.(errorMessage);
      },
      localStream
    );

    if (success) {
      setIsTranscribing(true);
      setResumeAfterMicOn(false);
      startWhisperCapture();
      setIsDrawerOpen(true);
      return true;
    }

    onError?.('Failed to start transcription. Please check your microphone permissions.');
    return false;
  };

  // Monitor microphone state and stop transcription if it's turned off
  useEffect(() => {
    // Update the service with the current stream whenever it changes
    if (localStream) {
      transcriptionServiceRef.current.updateMediaStream(localStream);
    }
    
    // If mic is turned off while transcribing, stop transcription
    if (isTranscribing && !micOn) {
      console.log('Microphone turned off, stopping transcription');
      stopTranscriptionSession();
      setResumeAfterMicOn(true);
      onError?.('Transcription stopped because microphone was turned off.');
    }
  }, [micOn, isTranscribing, localStream, onError]);

  // Auto-resume transcription once microphone is turned back on.
  useEffect(() => {
    if (!resumeAfterMicOn || !micOn || !localStream) return;
    const resumed = startTranscriptionSession();
    if (resumed) {
      onError?.('Microphone restored. Transcription resumed.', 'info');
    }
  }, [resumeAfterMicOn, micOn, localStream]);
  
  // Monitor audio tracks in the local stream
  useEffect(() => {
    if (!localStream) return;
    
    const handleTrackEnabled = (event) => {
      // If mic was re-enabled while transcription is active, restart it
      if (isTranscribing && event.target.kind === 'audio' && event.target.enabled) {
        console.log('Audio track enabled, restarting transcription');
        transcriptionServiceRef.current.restartWithStream(localStream);
      }
    };
    
    const audioTracks = localStream.getAudioTracks();
    audioTracks.forEach(track => {
      track.addEventListener('enabled', handleTrackEnabled);
    });
    
    return () => {
      audioTracks.forEach(track => {
        track.removeEventListener('enabled', handleTrackEnabled);
      });
    };
  }, [localStream, isTranscribing]);
  
  // Browser speech recognition should only use local microphone for speaker attribution.
  
  // Auto scroll to the bottom when transcripts update
  useEffect(() => {
    if (transcriptsEndRef.current && isDrawerOpen) {
      transcriptsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcripts, isDrawerOpen]);

  useEffect(() => {
    if (!meetingId) return;

    let isDisposed = false;

    const mergeLiveRows = (rows) => {
      if (!Array.isArray(rows) || rows.length === 0) return;

      setTranscripts(prev => {
        const next = [...prev];

        rows.forEach(row => {
          if (!row?.id || !row?.text) return;

          const existingIndex = next.findIndex(item =>
            item.id === row.id && item.speakerId === row.speakerId
          );

          const mapped = {
            id: row.id,
            speakerId: row.speakerId,
            speakerName: row.speakerName || 'Unknown',
            text: row.text,
            isFinal: Boolean(row.isFinal),
            startTime: row.createdAt || row.timestamp || new Date().toISOString(),
            endTime: row.isFinal ? (row.updatedAt || row.timestamp || new Date().toISOString()) : null,
            source: row.source || 'db-sync',
            isRemote: row.speakerId !== effectiveLocalUserId,
          };

          if (existingIndex >= 0) {
            next[existingIndex] = {
              ...next[existingIndex],
              ...mapped,
            };
          } else {
            next.push(mapped);
          }
        });

        return next;
      });
    };

    const pollLiveTranscripts = async () => {
      try {
        const params = new URLSearchParams();
        pollCycleRef.current += 1;
        const forceFullResync = pollCycleRef.current % 8 === 0;

        if (liveCursorRef.current && !forceFullResync) {
          params.set('since', liveCursorRef.current);
        }
        params.set('limit', '250');

        const response = await fetch(buildApiUrl(`/api/meetings/${meetingId}/transcripts?${params.toString()}`));
        if (!response.ok) return;

        const payload = await response.json();
        if (isDisposed) return;

        if (payload.latestCursor) {
          liveCursorRef.current = payload.latestCursor;
        }

        mergeLiveRows(payload.transcripts || []);
      } catch (error) {
        console.warn('Live transcript polling failed:', error?.message || error);
      }
    };

    const getPollIntervalMs = () => (document.visibilityState === 'visible' ? 450 : 1200);

    pollLiveTranscripts();
    let intervalId = setInterval(pollLiveTranscripts, getPollIntervalMs());

    const handleVisibilityChange = () => {
      clearInterval(intervalId);
      intervalId = setInterval(pollLiveTranscripts, getPollIntervalMs());
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isDisposed = true;
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [meetingId, API_BASE_URL, effectiveLocalUserId]);

  useEffect(() => {
    const persistedCandidates = transcripts.filter(item => item?.id && item?.text?.trim());
    if (persistedCandidates.length === 0 || !meetingId) return;

    persistedCandidates.forEach(async (item) => {
      const signature = `${item.text.trim()}::${item.isFinal ? 'final' : 'interim'}`;
      const previousSignature = lastPersistedTranscriptsRef.current.get(item.id);
      if (previousSignature === signature) return;

      lastPersistedTranscriptsRef.current.set(item.id, signature);

      if (item.isFinal) {
        savedTranscriptIdsRef.current.add(item.id);
      }

      try {
        const response = await fetch(buildApiUrl('/api/transcripts'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            meetingId,
            transcriptId: item.id,
            userId: item.speakerId || localUserId,
            speakerName: item.speakerName || localUserName,
            text: item.text,
            source: item.source || 'browser-stt',
            timestamp: item.startTime,
            isFinal: Boolean(item.isFinal),
          })
        });

        let persistedViaBackend = false;
        if (response.ok) {
          try {
            const payload = await response.json();
            persistedViaBackend = payload?.storage?.source === 'supabase';
          } catch {
            persistedViaBackend = false;
          }
        }

        // If backend did not confirm Supabase persistence, write directly from frontend.
        if (!persistedViaBackend) {
          await persistTranscriptDirectlyToSupabase(item);
        }
      } catch (error) {
        console.error('Failed to persist transcript line:', error);
        await persistTranscriptDirectlyToSupabase(item);
      }
    });
  }, [transcripts, meetingId, localUserId, localUserName, API_BASE_URL]);

  useEffect(() => {
    const finalTranscripts = transcripts.filter(item => item?.isFinal);
    if (!meetingId || finalTranscripts.length < 3 || insightApiUnavailableRef.current) return;

    if (insightsDebounceRef.current) {
      clearTimeout(insightsDebounceRef.current);
    }

    insightsDebounceRef.current = setTimeout(async () => {
      try {
        if (backendAiConfiguredRef.current === null) {
          try {
            const statusResponse = await fetch(buildApiUrl('/api/status'));
            if (statusResponse.ok) {
              const statusPayload = await statusResponse.json();
              backendAiConfiguredRef.current = Boolean(
                statusPayload.aiConfigured ?? statusPayload.openaiConfigured
              );
            }
          } catch (statusError) {
            console.warn('Could not check backend AI capability:', statusError);
          }
        }

        if (backendAiConfiguredRef.current === false) {
          return;
        }

        setIsAiLoading(true);
        const response = await fetch(buildApiUrl('/api/ai-insights'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            meetingId,
            transcripts: finalTranscripts.map(item => ({
              speakerName: item.speakerName,
              text: item.text
            }))
          })
        });

        if (!response.ok) {
          throw new Error(`Insight API failed: ${response.status}`);
        }

        const payload = await response.json();
        setServerIntelligence({
          summaryBullets: payload.summaryBullets || [],
          actionItems: payload.actionItems || [],
          decisions: (payload.decisions || []).map(text => ({ text, type: 'decision' })),
          risks: (payload.risks || []).map(text => ({ text, type: 'risk' })),
          questions: (payload.questions || []).map(text => ({ text, type: 'question' })),
          highlights: [
            ...(payload.decisions || []).map(text => ({ type: 'decision', text })),
            ...(payload.risks || []).map(text => ({ type: 'risk', text })),
            ...(payload.questions || []).map(text => ({ type: 'question', text }))
          ],
          speakerStats: intelligence.speakerStats,
          metrics: {
            ...intelligence.metrics,
            productivityScore: typeof payload.score === 'number' ? payload.score : intelligence.metrics.productivityScore,
            hasEnoughSignal: payload.status !== 'insufficient-context'
          }
        });
      } catch (error) {
        console.error('AI insight fetch failed:', error);
        if (!insightApiUnavailableRef.current && /Insight API failed: 5\d\d/i.test(error.message || '')) {
          insightApiUnavailableRef.current = true;
          onError?.('AI insights backend is unavailable right now. Local analysis will continue.', 'warning');
        }
      } finally {
        setIsAiLoading(false);
      }
    }, 1800);

    return () => {
      if (insightsDebounceRef.current) {
        clearTimeout(insightsDebounceRef.current);
      }
    };
  }, [transcripts, meetingId, API_BASE_URL, intelligence]);
  
  /**
   * Toggle transcription state
   */
  const pushWhisperChunk = async (audioBlob) => {
    if (!audioBlob || audioBlob.size < 2048 || !meetingId) return;

    try {
      const formData = new FormData();
      const whisperLanguageHint = transcriptionServiceRef.current.getWhisperLanguageHint?.();
      formData.append('audio', audioBlob, `chunk-${Date.now()}.webm`);
      formData.append('meetingId', meetingId);
      formData.append('userId', effectiveLocalUserId);
      formData.append('speakerName', effectiveLocalUserName);
      formData.append('timestamp', new Date().toISOString());
      if (whisperLanguageHint) {
        formData.append('language', whisperLanguageHint);
      }

      const response = await fetch(buildApiUrl('/api/transcribe-whisper'), {
        method: 'POST',
        body: formData,
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        // Only log error, don't throw to prevent breaking transcription
        console.warn('Whisper API not available:', response.status);
        return;
      }

      const payload = await response.json();
      const text = (payload.text || '').trim();
      if (!text) return;

      setTranscripts((prev) => {
        const duplicate = prev.some(item => item.isFinal && item.text?.trim() === text);
        if (duplicate) return prev;

        const whisperTranscript = {
          id: `whisper-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          speakerId: effectiveLocalUserId,
          speakerName: effectiveLocalUserName,
          text,
          isFinal: true,
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          source: 'whisper'
        };

        return [...prev, whisperTranscript];
      });
    } catch (error) {
      // Improved error handling - don't spam console
      if (error.name === 'AbortError') {
        console.log('Whisper request timed out');
      } else if (!whisperNetworkWarnedRef.current) {
        console.error('Whisper chunk upload failed:', error);
        whisperNetworkWarnedRef.current = true;
        onError?.('Whisper transcription service is unavailable. Browser transcription will continue.', 'warning');
      }
    }
  };

  const startWhisperCapture = () => {
    if (!localStream || !meetingId || !window.MediaRecorder) return;

    try {
      cleanupWhisperCaptureResources();

      const whisperStream = buildWhisperCaptureStream();
      if (!whisperStream) return;

      const recorder = new MediaRecorder(whisperStream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm'
      });

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          pushWhisperChunk(event.data);
        }
      };

      recorder.onerror = (event) => {
        console.error('Whisper recorder error:', event.error);
      };

      recorder.start(7000);
      whisperRecorderRef.current = recorder;
      setIsWhisperActive(true);
    } catch (error) {
      console.error('Failed to start Whisper capture:', error);
    }
  };

  const stopWhisperCapture = () => {
    if (whisperRecorderRef.current && whisperRecorderRef.current.state !== 'inactive') {
      whisperRecorderRef.current.stop();
    }
    whisperRecorderRef.current = null;
    setIsWhisperActive(false);
    cleanupWhisperCaptureResources();
  };

  function stopTranscriptionSession() {
    transcriptionServiceRef.current.stopTranscription();
    stopWhisperCapture();
    setIsTranscribing(false);
  }

  const handleTranscriptionButtonClick = () => {
    if (!isSupported && !window.MediaRecorder) {
      onError?.('Speech recognition is not supported in your browser. Please try Chrome, Edge, or Safari.');
      return;
    }
    
    if (isTranscribing) {
      // When transcription is running, this button controls panel visibility.
      setIsDrawerOpen(prev => !prev);
    } else {
      startTranscriptionSession();
    }
  };
  
  /**
   * Handle language menu open
   */
  const handleLanguageMenuOpen = (event) => {
    setLanguageAnchorEl(event.currentTarget);
    setIsLanguageMenuOpen(true);
  };
  
  /**
   * Handle language menu close
   */
  const handleLanguageMenuClose = () => {
    setLanguageAnchorEl(null);
    setIsLanguageMenuOpen(false);
  };
  
  /**
   * Handle language selection
   */
  const handleLanguageSelect = (languageCode) => {
    transcriptionServiceRef.current.setLanguage(languageCode);
    handleLanguageMenuClose();
  };
  
  /**
   * Clear all transcripts
   */
  const handleClearTranscripts = () => {
    transcriptionServiceRef.current.clearTranscripts();
    setTranscripts([]);
  };
  
  /**
   * Handle closing export menu
   */
  const handleExportMenuClose = () => {
    setExportAnchorEl(null);
    setIsExportMenuOpen(false);
  };
  
  /**
   * Export transcripts as file (txt, json, pdf)
   */
  const handleExportTranscripts = async (format = 'txt') => {
    try {
      setIsExporting(true);
      handleExportMenuClose();
      
      // Show loading indicator for PDF generation
      if (format === 'pdf') {
        onError?.('Generating PDF transcript...', 'info');
      }
      
      // Get blob from service
      const blobResult = transcriptionServiceRef.current.exportTranscripts(format);
      
      // Handle async (Promise) or sync (Blob) result
      const blob = blobResult instanceof Promise ? await blobResult : blobResult;
      
      if (blob) {
        const now = new Date();
        const dateString = now.toISOString().replace(/[:.]/g, '-').substring(0, 19);
        const extension = format;
        const filename = `nexus-transcription-${dateString}.${extension}`;
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        
        // Trigger download
        a.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 100);
        
        if (format === 'pdf') {
          onError?.('PDF transcript generated successfully!', 'success');
        }
      }
    } catch (err) {
      console.error('Error exporting transcript:', err);
      onError?.(`Failed to export transcript: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };
  
  // Determine the tooltip message based on state
  const getTooltipMessage = () => {
    if (!isSupported && !window.MediaRecorder) return "Transcription not supported in this browser";
    if (isTranscribing) return isDrawerOpen ? "Close transcription panel" : "Open transcription panel";
    if (!micOn) return "Microphone is off - Turn on microphone to enable transcription";
    
    // Check audio tracks in local stream
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length === 0) {
        return "No audio input detected - Check microphone connection";
      }
      if (!audioTracks.some(track => track.enabled)) {
        return "Microphone is muted - Unmute to enable transcription";
      }
    }
    
    return "Start Transcription";
  };

  const highlightStyles = {
    decision: { label: 'Decision', color: '#d32f2f', background: 'rgba(211, 47, 47, 0.08)' },
    action: { label: 'Action', color: '#2e7d32', background: 'rgba(46, 125, 50, 0.08)' },
    question: { label: 'Question', color: '#1565c0', background: 'rgba(21, 101, 192, 0.08)' },
    risk: { label: 'Risk', color: '#ed6c02', background: 'rgba(237, 108, 2, 0.08)' },
    important: { label: 'Important', color: '#6a1b9a', background: 'rgba(106, 27, 154, 0.08)' },
    neutral: { label: '', color: '#bdbdbd', background: 'transparent' }
  };

  const getActionConfidence = (actionItem) => {
    const taskScore = actionItem?.task ? 0.4 : 0;
    const ownerScore = actionItem?.assignee && actionItem.assignee !== 'Unassigned' ? 0.35 : 0;
    const deadlineScore = actionItem?.deadline && actionItem.deadline !== 'TBD' ? 0.25 : 0;
    return Math.round((taskScore + ownerScore + deadlineScore) * 100);
  };

  const buildFollowUpEmail = () => {
    const summary = (effectiveIntelligence.summaryBullets || []).slice(0, 4);
    const decisions = (effectiveIntelligence.decisions || []).slice(0, 4);
    const actions = (effectiveIntelligence.actionItems || []).slice(0, 8);

    const lines = [
      'Subject: Meeting follow-up and next actions',
      '',
      'Hi team,',
      '',
      'Here is the AI-generated summary from today\'s meeting:',
      '',
      'Summary:',
      ...(summary.length > 0 ? summary.map(item => `- ${item}`) : ['- Summary is still calibrating based on transcript signal.']),
      '',
      'Key decisions:',
      ...(decisions.length > 0 ? decisions.map(item => `- ${item.text || item}`) : ['- No major decisions captured yet.']),
      '',
      'Action items:',
      ...(actions.length > 0
        ? actions.map((item, idx) => {
            const confidence = getActionConfidence(item);
            return `${idx + 1}. ${item.task || 'Task pending clarification'} | Owner: ${item.assignee || 'Unassigned'} | Deadline: ${item.deadline || 'TBD'} | Confidence: ${confidence}%`;
          })
        : ['- No action items captured yet.']),
      '',
      'Thanks,',
      'Nexus AI Meeting Copilot'
    ];

    return lines.join('\n');
  };

  const buildActionExport = () => {
    const actionItems = (effectiveIntelligence.actionItems || []).map((item, idx) => ({
      id: idx + 1,
      task: item.task || 'Task pending clarification',
      owner: item.assignee || 'Unassigned',
      deadline: item.deadline || 'TBD',
      status: item.status || 'open',
      confidence: getActionConfidence(item),
      approved: Boolean(approvedActions[idx])
    }));

    const payload = {
      meetingId,
      generatedAt: new Date().toISOString(),
      actionItems
    };

    return JSON.stringify(payload, null, 2);
  };

  const copyToClipboard = async (value, successMessage) => {
    try {
      await navigator.clipboard.writeText(value);
      onError?.(successMessage, 'success');
    } catch (error) {
      console.error('Copy failed:', error);
      onError?.('Copy failed. Please try again.', 'error');
    }
  };

  const resolveCommitmentQuestion = (question) => {
    const match = question.trim().match(/^what did\s+(.+?)\s+commit\s+to\??$/i);
    if (!match) return null;

    const person = match[1].trim();
    if (!person) return null;

    const candidate = [...transcripts]
      .reverse()
      .find(item => item?.isFinal
        && item?.speakerName?.toLowerCase().includes(person.toLowerCase())
        && /\b(will|commit|deliver|finish|complete|send|share|submit|by)\b/i.test(item.text || ''));

    if (!candidate) {
      return `I could not find a clear commitment from ${person}. Ask the speaker to use explicit commitment language like "I will deliver by Friday".`;
    }

    const timestamp = new Date(candidate.startTime || Date.now()).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    return `${candidate.speakerName} commitment at ${timestamp}:\n"${candidate.text}"`;
  };

  const runAskAnything = (question) => {
    if (!question?.trim()) return;

    const commitmentAnswer = resolveCommitmentQuestion(question);
    if (commitmentAnswer) {
      setAskAnswer(commitmentAnswer);
      return;
    }

    const askBackend = async () => {
      if (!meetingId) throw new Error('Missing meetingId');

      const response = await fetch(buildApiUrl('/api/ai-chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId,
          question,
          transcripts: transcripts.filter(item => item?.isFinal).map(item => ({
            speakerName: item.speakerName,
            text: item.text
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`Chat API failed: ${response.status}`);
      }

      const payload = await response.json();
      setAskAnswer(payload.answer || 'No answer generated.');
    };

    askBackend().catch(() => {
      const response = answerMeetingQuestion(question, effectiveIntelligence);
      setAskAnswer(response);
    });
  };
  
  return (
    <>
      <Tooltip title={getTooltipMessage()}>
        <span>
          <IconButton
            onClick={handleTranscriptionButtonClick}
            disabled={(!isSupported && !window.MediaRecorder) || (!isTranscribing && !micOn)}
            sx={{ 
              position: 'relative',
              bgcolor: isTranscribing ? 'rgba(103, 58, 183, 0.1)' : (!micOn ? 'rgba(244, 67, 54, 0.05)' : 'rgba(33, 150, 243, 0.1)'), 
              color: isTranscribing 
                ? 'var(--color-primary)' 
                : (!micOn ? 'rgba(244, 67, 54, 0.5)' : 'var(--color-secondary)'), 
              borderRadius: 'var(--button-radius)',
              p: { xs: 1, sm: 1.5 },
              '&:hover': {
                bgcolor: isTranscribing 
                  ? 'rgba(103, 58, 183, 0.2)' 
                  : (!micOn ? 'rgba(244, 67, 54, 0.1)' : 'rgba(33, 150, 243, 0.2)')
              },
              '&.Mui-disabled': {
                bgcolor: !micOn ? 'rgba(244, 67, 54, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                color: !micOn ? 'rgba(244, 67, 54, 0.4)' : 'rgba(0, 0, 0, 0.26)'
              },
              '&::after': !micOn ? {
                content: '""',
                position: 'absolute',
                width: '75%',
                height: '2px',
                background: 'rgba(244, 67, 54, 0.5)',
                transform: 'rotate(45deg)'
              } : {}
            }}
          >
            {isTranscribing ? <RecordVoiceOverIcon /> : <VoiceOverOffIcon />}
          </IconButton>
        </span>
      </Tooltip>
      
      {/* Transcription Drawer */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': { 
            width: { xs: '100%', sm: 400 },
            maxWidth: '100%',
            boxSizing: 'border-box',
            p: 0,
            backgroundColor: 'var(--surface-elevated)',
            color: 'var(--text-primary)',
            borderLeft: '1px solid var(--border-color)'
          },
        }}
      >
        {/* Drawer Header */}
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-color)', 
          bgcolor: isTranscribing ? 'rgba(103, 58, 183, 0.08)' : 'var(--surface-elevated)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isTranscribing && (
              <CircularProgress size={20} sx={{ color: 'var(--color-primary)' }} />
            )}
            <Typography variant="h6" fontWeight={600}>
              AI Meeting Intelligence
            </Typography>
            {isTranscribing && (
              <Chip 
                label="Active" 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            )}
            {isWhisperActive && (
              <Chip
                label="Sync"
                size="small"
                sx={{
                  color: 'var(--color-secondary)',
                  borderColor: 'var(--color-secondary)'
                }}
                variant="outlined"
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isTranscribing && (
              <Tooltip title="Stop transcription">
                <IconButton
                  size="small"
                  onClick={stopTranscriptionSession}
                  sx={{ color: 'var(--color-error)' }}
                >
                  <VoiceOverOffIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Select language">
              <IconButton 
                size="small"
                onClick={handleLanguageMenuOpen}
                sx={{ color: 'var(--color-secondary)' }}
              >
                <TranslateIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Clear transcripts">
              <IconButton 
                size="small"
                onClick={handleClearTranscripts}
                disabled={transcripts.length === 0}
                sx={{ color: transcripts.length > 0 ? 'var(--color-error)' : undefined }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export transcripts">
              <IconButton 
                size="small"
                onClick={(e) => {
                  setExportAnchorEl(e.currentTarget);
                  setIsExportMenuOpen(true);
                }}
                disabled={transcripts.length === 0}
                sx={{ color: transcripts.length > 0 ? 'var(--color-success)' : undefined }}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Close">
              <IconButton 
                size="small"
                onClick={() => setIsDrawerOpen(false)}
                sx={{ ml: 1 }}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {/* Current Language Indicator */}
        <Box 
          sx={{
            px: 2,
            py: 1,
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: 'var(--surface-soft)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TranslateIcon fontSize="small" sx={{ mr: 1, color: 'var(--color-secondary)', opacity: 0.7 }} />
            <Typography variant="body2" color="var(--text-secondary)">
              Current language: <strong>{
                languageOptions.find(
                  lang => lang.code === transcriptionServiceRef.current.currentLanguage
                )?.name || 'English (US)'
              }</strong>
            </Typography>
          </Box>
          <Button
            size="small"
            variant="text"
            onClick={handleLanguageMenuOpen}
            sx={{ 
              color: 'var(--color-secondary)',
              textTransform: 'none',
              fontWeight: 500,
              p: 0.5
            }}
          >
            Change
          </Button>
        </Box>
        
        <Tabs
          value={activeTab}
          onChange={(event, value) => setActiveTab(value)}
          variant="fullWidth"
          sx={{
            borderBottom: '1px solid var(--border-color)',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              minHeight: 44,
              color: 'var(--text-secondary)'
            },
            '& .Mui-selected': {
              color: 'var(--color-primary) !important'
            }
          }}
        >
          <Tab label={`Transcript (${transcripts.length})`} />
          <Tab icon={<AutoGraphIcon fontSize="small" />} iconPosition="start" label="Insights" />
          <Tab icon={<AssignmentTurnedInIcon fontSize="small" />} iconPosition="start" label="Deliverables" />
          <Tab icon={<QuizIcon fontSize="small" />} iconPosition="start" label="Ask" />
        </Tabs>

        {/* Content Panel */}
        <Box sx={{ 
          flex: 1, 
          overflowY: 'auto', 
          height: 'calc(100% - 64px)',
          bgcolor: 'var(--surface-soft)'
        }}>
          {activeTab === 0 && transcripts.length === 0 ? (
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              p: 3,
              opacity: 0.7
            }}>
              <VoiceOverOffIcon sx={{ fontSize: 48, color: 'var(--text-muted)', mb: 2 }} />
              <Typography variant="body1" color="var(--text-muted)" textAlign="center" gutterBottom>
                No transcriptions yet
              </Typography>
              <Typography variant="body2" color="var(--text-muted)" textAlign="center">
                {isTranscribing 
                  ? "Start speaking to see real-time transcriptions"
                  : "Click the transcription button to start"
                }
              </Typography>
            </Box>
          ) : null}

          {activeTab === 0 && transcripts.length > 0 ? (
            <List sx={{ py: 0 }}>
              {transcripts.map((transcript, index) => (
                <React.Fragment key={transcript.id || index}>
                  {(() => {
                    const lineType = classifyTranscriptLine(transcript.text);
                    const style = highlightStyles[lineType] || highlightStyles.neutral;

                    return (
                      <>
                  {/* Show date divider if first item or if date changes from previous item */}
                  {(index === 0 || (
                    new Date(transcript.startTime).toLocaleDateString() !==
                    new Date(transcripts[index-1].startTime).toLocaleDateString()
                  )) && (
                    <Box sx={{ 
                      textAlign: 'center',
                      py: 1,
                      px: 2,
                      bgcolor: 'rgba(127, 145, 176, 0.12)'
                    }}>
                      <Typography variant="caption" color="var(--text-muted)">
                        {new Date(transcript.startTime).toLocaleDateString(undefined, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    </Box>
                  )}
                
                  <ListItem 
                    alignItems="flex-start" 
                    sx={{ 
                      opacity: transcript.isFinal ? 1 : 0.7,
                      bgcolor: transcript.isFinal ? style.background : 'rgba(103, 58, 183, 0.04)',
                      py: 1,
                      borderBottom: '1px solid var(--border-color)',
                      borderLeft: transcript.isFinal && lineType !== 'neutral' ? `3px solid ${style.color}` : '3px solid transparent'
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          bgcolor: transcript.speakerId === localUserId 
                            ? 'var(--color-primary)' 
                            : 'var(--color-secondary)',
                          width: 35,
                          height: 35
                        }}
                      >
                        {transcript.speakerName.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" component="span">
                              {transcript.speakerName}
                            </Typography>
                            {lineType !== 'neutral' && transcript.isFinal && (
                              <Chip
                                size="small"
                                label={style.label}
                                sx={{
                                  height: 20,
                                  color: style.color,
                                  border: `1px solid ${style.color}`,
                                  backgroundColor: 'var(--surface-elevated)',
                                  fontWeight: 600,
                                  '& .MuiChip-label': { px: 0.8 }
                                }}
                              />
                            )}
                          </Box>
                          <Typography variant="caption" color="var(--text-muted)">
                            {new Date(transcript.startTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography 
                          variant="body2" 
                          color="var(--text-primary)"
                          sx={{ 
                            wordBreak: 'break-word',
                            lineHeight: 1.5,
                            fontWeight: transcript.isFinal ? 400 : 300
                          }}
                        >
                          {transcript.text}
                        </Typography>
                      }
                    />
                  </ListItem>
                      </>
                    );
                  })()}
                </React.Fragment>
              ))}
              {/* Empty div for auto scrolling to bottom */}
              <div ref={transcriptsEndRef} />
            </List>
          ) : null}

          {activeTab === 1 ? (
            <Box sx={{ p: 2, display: 'grid', gap: 2 }}>
              <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(0,0,0,0.06)' }}>
                <Typography variant="subtitle2" color="text.secondary">Meeting Productivity Score</Typography>
                <Typography variant="h3" fontWeight={800} sx={{ color: effectiveIntelligence.metrics.productivityScore && effectiveIntelligence.metrics.productivityScore > 75 ? 'var(--color-success)' : 'var(--color-secondary)' }}>
                  {effectiveIntelligence.metrics.productivityScore === null ? 'Calibrating' : `${effectiveIntelligence.metrics.productivityScore}%`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Participation balance: {effectiveIntelligence.metrics.participationBalance}%
                </Typography>
                {isAiLoading && (
                  <Typography variant="caption" color="text.secondary">Refreshing AI insights...</Typography>
                )}
                {!effectiveIntelligence.metrics.hasEnoughSignal && (
                  <Typography variant="caption" color="text.secondary">
                    Need {effectiveIntelligence.metrics.signalLinesRequired - effectiveIntelligence.metrics.meaningfulTranscriptLines} more meaningful transcript lines for stable scoring.
                  </Typography>
                )}
              </Paper>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 1 }}>
                <Paper sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Action Items</Typography>
                  <Typography variant="h6" fontWeight={700}>{effectiveIntelligence.metrics.totalActionItems}</Typography>
                </Paper>
                <Paper sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Decisions</Typography>
                  <Typography variant="h6" fontWeight={700}>{effectiveIntelligence.metrics.totalDecisions}</Typography>
                </Paper>
                <Paper sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Risks</Typography>
                  <Typography variant="h6" fontWeight={700}>{effectiveIntelligence.metrics.totalRisks}</Typography>
                </Paper>
                <Paper sx={{ p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">Transcript Lines</Typography>
                  <Typography variant="h6" fontWeight={700}>{effectiveIntelligence.metrics.totalTranscriptLines}</Typography>
                </Paper>
              </Box>

              <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AssignmentTurnedInIcon fontSize="small" /> AI Action Center
                </Typography>
                {effectiveIntelligence.actionItems.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No action items detected yet. Speak clear assignments like "Shlok will finish slides by Monday".</Typography>
                ) : (
                  effectiveIntelligence.actionItems.map((item, index) => (
                    <Paper key={`${item.task}-${index}`} variant="outlined" sx={{ p: 1.2, mb: 1, borderRadius: 1.5 }}>
                      <Typography variant="body2" fontWeight={600}>{item.task}</Typography>
                      <Typography variant="caption" color="text.secondary">Owner: {item.assignee} | Deadline: {item.deadline}</Typography>
                      <Box sx={{ mt: 0.8, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          size="small"
                          label={`Confidence ${getActionConfidence(item)}%`}
                          color={getActionConfidence(item) >= 70 ? 'success' : 'warning'}
                          variant="outlined"
                        />
                        <Chip
                          size="small"
                          label={approvedActions[index] ? 'Approved' : 'Needs Review'}
                          color={approvedActions[index] ? 'success' : 'default'}
                          onClick={() => {
                            setApprovedActions(prev => ({ ...prev, [index]: !prev[index] }));
                          }}
                        />
                      </Box>
                    </Paper>
                  ))
                )}
              </Paper>

              <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Smart Highlights</Typography>
                {effectiveIntelligence.highlights.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">Highlights will appear as the conversation grows.</Typography>
                ) : (
                  effectiveIntelligence.highlights.slice(0, 8).map((item, index) => {
                    const style = highlightStyles[item.type] || highlightStyles.neutral;
                    return (
                      <Box key={`${item.text}-${index}`} sx={{ mb: 1, p: 1.2, borderRadius: 1.5, background: style.background, borderLeft: `3px solid ${style.color}` }}>
                        <Typography variant="caption" sx={{ color: style.color, fontWeight: 700, textTransform: 'uppercase' }}>{style.label}</Typography>
                        <Typography variant="body2">{item.text}</Typography>
                      </Box>
                    );
                  })
                )}
              </Paper>

              <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Talk Ratio</Typography>
                {effectiveIntelligence.speakerStats.speakers.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No speaker data yet.</Typography>
                ) : (
                  effectiveIntelligence.speakerStats.speakers.map((speaker) => (
                    <Box key={speaker.speaker} sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">{speaker.speaker}</Typography>
                        <Typography variant="body2" fontWeight={600}>{speaker.ratio}%</Typography>
                      </Box>
                      <Box sx={{ height: 6, borderRadius: 99, background: 'rgba(127, 145, 176, 0.24)' }}>
                        <Box sx={{ width: `${speaker.ratio}%`, height: '100%', borderRadius: 99, background: 'var(--color-secondary)' }} />
                      </Box>
                    </Box>
                  ))
                )}
              </Paper>
            </Box>
          ) : null}

          {activeTab === 2 ? (
            <Box sx={{ p: 2, display: 'grid', gap: 1.2 }}>
              <Typography variant="subtitle2" fontWeight={700}>One-Click Deliverables</Typography>
              <Paper sx={{ p: 1.5, borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.2 }}>
                  Export ready-to-share outcomes for Slack, Notion, Trello, or email.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => copyToClipboard(buildFollowUpEmail(), 'Follow-up email copied.')}
                  >
                    Copy Follow-up Email
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ContentCopyIcon />}
                    onClick={() => copyToClipboard(buildActionExport(), 'Action JSON copied for import tools.')}
                  >
                    Copy Action JSON
                  </Button>
                </Box>
              </Paper>

              <Paper sx={{ p: 1.5, borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={700}>Structured Meeting Report</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Summary points: {(effectiveIntelligence.summaryBullets || []).length}
                </Typography>
                <Typography variant="body2">Decisions: {(effectiveIntelligence.decisions || []).length}</Typography>
                <Typography variant="body2">Action items: {(effectiveIntelligence.actionItems || []).length}</Typography>
                <Typography variant="body2">Risks: {(effectiveIntelligence.risks || []).length}</Typography>
              </Paper>
            </Box>
          ) : null}

          {activeTab === 3 ? (
            <Box sx={{ p: 2, display: 'grid', gap: 1.2 }}>
              <Typography variant="subtitle2" fontWeight={700}>Ask Nexus Intelligence</Typography>
              <Paper sx={{ p: 1.2, borderRadius: 1.5, background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}>
                <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                  How to use: speak decision statements, owners, and deadlines naturally. Example: "Shlok will submit PPT by Monday" or "We decided to launch beta next week".
                </Typography>
              </Paper>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {quickPrompts.map((prompt) => (
                  <Chip
                    key={prompt}
                    label={prompt}
                    onClick={() => {
                      setAskQuery(prompt);
                      runAskAnything(prompt);
                    }}
                    sx={{ cursor: 'pointer' }}
                    variant="outlined"
                  />
                ))}
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="What decisions were made?"
                  value={askQuery}
                  onChange={(e) => setAskQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      runAskAnything(askQuery);
                    }
                  }}
                />
                <Button variant="contained" onClick={() => runAskAnything(askQuery)}>
                  Ask
                </Button>
              </Box>

              <Paper sx={{ p: 1.5, borderRadius: 2, mt: 1, whiteSpace: 'pre-line' }}>
                <Typography variant="body2">{askAnswer}</Typography>
              </Paper>

              <Paper sx={{ p: 1.5, borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={700}>Quick Summary</Typography>
                {effectiveIntelligence.summaryBullets.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">Summary appears after meaningful lines are captured (avoid greetings/tests only).</Typography>
                ) : (
                  effectiveIntelligence.summaryBullets.map((bullet, index) => (
                    <Typography key={`${bullet}-${index}`} variant="body2" sx={{ mt: 0.8 }}>• {bullet}</Typography>
                  ))
                )}
              </Paper>
            </Box>
          ) : null}
        </Box>
        
        {/* Bottom controls */}
        <Box sx={{
          p: 2,
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          bgcolor: 'var(--surface-elevated)'
        }}>
          <Button 
            variant="outlined"
            size="small"
            startIcon={<DeleteIcon />}
            onClick={handleClearTranscripts}
            disabled={transcripts.length === 0}
            color="error"
            sx={{ borderRadius: 'var(--button-radius)' }}
          >
            Clear
          </Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={(e) => {
                setExportAnchorEl(e.currentTarget);
                setIsExportMenuOpen(true);
              }}
              disabled={transcripts.length === 0}
              sx={{ 
                borderRadius: 'var(--button-radius)',
                bgcolor: 'var(--color-primary)',
                '&:hover': {
                  bgcolor: 'var(--color-secondary)'
                }
              }}
            >
              Export Transcript
            </Button>
          </Box>
        </Box>
      </Drawer>
      
      {/* Language selection menu */}
      <Menu
        anchorEl={languageAnchorEl}
        open={isLanguageMenuOpen}
        onClose={handleLanguageMenuClose}
        sx={{ maxHeight: 300 }}
      >
        <MenuItem disabled>
          <Typography variant="body2" color="var(--text-muted)">
            Select language
          </Typography>
        </MenuItem>
        <Divider />
        {languageOptions.map(language => (
          <MenuItem 
            key={language.code} 
            onClick={() => handleLanguageSelect(language.code)}
            selected={transcriptionServiceRef.current.currentLanguage === language.code}
          >
            {language.name}
          </MenuItem>
        ))}
      </Menu>
      
      {/* Export format menu */}
      <Menu
        anchorEl={exportAnchorEl}
        open={isExportMenuOpen}
        onClose={handleExportMenuClose}
      >
        <MenuItem disabled>
          <Typography variant="body2" color="var(--text-muted)">
            Choose export format
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleExportTranscripts('txt')} disabled={isExporting}>
          <ListItemText 
            primary="Plain Text (.txt)" 
            secondary="Simple text format" 
          />
        </MenuItem>
        <MenuItem onClick={() => handleExportTranscripts('json')} disabled={isExporting}>
          <ListItemText 
            primary="JSON (.json)" 
            secondary="Machine-readable format" 
          />
        </MenuItem>
        <MenuItem onClick={() => handleExportTranscripts('pdf')} disabled={isExporting}>
          <ListItemText 
            primary="PDF Document (.pdf)" 
            secondary="Professional document format" 
          />
          {isExporting && <CircularProgress size={20} sx={{ ml: 1 }} />}
        </MenuItem>
      </Menu>
    </>
  );
}

export default TranscriptionButton;
