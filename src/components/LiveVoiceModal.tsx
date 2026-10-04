import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Radio,
  AlertCircle,
  Headphones,
} from 'lucide-react';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'speaking' | 'listening' | 'error'>('connecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [transcripts, setTranscripts] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    { sender: 'assistant', text: 'Hello! I am your real-time voice assistant for SRIT Jabalpur. Ask me anything about courses, faculty, fests, or attendance!' }
  ]);

  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      cleanup();
      return;
    }
    startLiveSession();
    return () => {
      cleanup();
    };
  }, [isOpen]);

  const cleanup = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close().catch(() => {});
      outputAudioContextRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    audioQueueRef.current = [];
    isPlayingRef.current = false;
  };

  const startLiveSession = async () => {
    setStatus('connecting');
    setErrorMessage(null);

    try {
      // 1. Setup AudioContexts: Input 16kHz, Output 24kHz
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioCtx({ sampleRate: 16000 });
      audioContextRef.current = inputCtx;

      const outputCtx = new AudioCtx({ sampleRate: 24000 });
      outputAudioContextRef.current = outputCtx;

      // 2. Request microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStreamRef.current = stream;

      // 3. Connect WebSocket to /live
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setStatus('connected');
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'ready') {
            setStatus('listening');
          } else if (data.type === 'text' && data.text) {
            setTranscripts((prev) => [...prev, { sender: 'assistant', text: data.text }]);
          } else if (data.type === 'audio' && data.audio) {
            setStatus('speaking');
            playAudioBase64(data.audio);
          } else if (data.type === 'interrupted') {
            audioQueueRef.current = [];
            isPlayingRef.current = false;
            setStatus('listening');
          } else if (data.type === 'error') {
            setErrorMessage(data.message);
          }
        } catch (e) {
          console.error('Error processing live socket message:', e);
        }
      };

      ws.onerror = (e) => {
        console.warn('Live WebSocket error:', e);
        setStatus('error');
        setErrorMessage('Voice server offline or unable to connect. You can still use chat and text-to-speech.');
      };

      ws.onclose = () => {
        setStatus('error');
      };

      // 4. Capture and stream audio chunks
      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (isMuted || ws.readyState !== WebSocket.OPEN) return;
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32 to Int16 PCM
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        // Base64 encode
        let binary = '';
        const bytes = new Uint8Array(pcm16.buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);

        ws.send(JSON.stringify({ audio: base64 }));
      };

      source.connect(processor);
      processor.connect(inputCtx.destination);
    } catch (err: any) {
      console.error('Failed to initialize microphone or live voice:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'Microphone access denied or audio device unavailable.');
    }
  };

  const playAudioBase64 = (base64Audio: string) => {
    if (!outputAudioContextRef.current) return;
    try {
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const audioBuffer = outputAudioContextRef.current.createBuffer(1, float32Array.length, 24000);
      audioBuffer.copyToChannel(float32Array, 0);

      audioQueueRef.current.push(audioBuffer);
      if (!isPlayingRef.current) {
        playNextInQueue();
      }
    } catch (err) {
      console.error('Audio decoding error:', err);
    }
  };

  const playNextInQueue = () => {
    if (audioQueueRef.current.length === 0 || !outputAudioContextRef.current) {
      isPlayingRef.current = false;
      setStatus('listening');
      return;
    }
    isPlayingRef.current = true;
    const buffer = audioQueueRef.current.shift()!;
    const sourceNode = outputAudioContextRef.current.createBufferSource();
    sourceNode.buffer = buffer;
    sourceNode.connect(outputAudioContextRef.current.destination);
    sourceNode.onended = () => {
      playNextInQueue();
    };
    sourceNode.start();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden text-center">
        {/* Top Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="font-extrabold text-sm text-slate-900 dark:text-white">
              SRIT Live Voice Conversation
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
              gemini-3.8-live
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Animated Voice Orb Visualizer */}
        <div className="py-10 px-6 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center w-36 h-36">
            {/* Pulsing Outer Rings */}
            <div
              className={`absolute inset-0 rounded-full transition-all duration-300 ${
                status === 'speaking'
                  ? 'bg-blue-500/20 scale-125 animate-ping'
                  : status === 'listening'
                  ? 'bg-emerald-500/20 scale-110 animate-pulse'
                  : 'bg-slate-200 dark:bg-slate-800 scale-100'
              }`}
            />
            <div
              className={`absolute inset-2 rounded-full transition-all duration-500 ${
                status === 'speaking'
                  ? 'bg-indigo-500/30 scale-115'
                  : status === 'listening'
                  ? 'bg-emerald-500/30 scale-105'
                  : 'bg-slate-100 dark:bg-slate-800'
              }`}
            />
            {/* Core Orb */}
            <div
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
                status === 'speaking'
                  ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/40 scale-105'
                  : status === 'listening'
                  ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-emerald-500/40'
                  : status === 'connecting'
                  ? 'bg-amber-500 text-white shadow-amber-500/30 animate-pulse'
                  : 'bg-slate-700 text-white'
              }`}
            >
              {status === 'speaking' ? (
                <Volume2 className="w-10 h-10 animate-bounce" />
              ) : status === 'listening' ? (
                <Mic className="w-10 h-10 animate-pulse" />
              ) : (
                <Radio className="w-10 h-10" />
              )}
            </div>
          </div>

          {/* Status Label */}
          <div className="mt-5 space-y-1">
            <h4 className="font-bold text-base text-slate-900 dark:text-white capitalize">
              {status === 'speaking'
                ? 'SRIT AI Speaking...'
                : status === 'listening'
                ? 'Listening to you... Speak naturally'
                : status === 'connecting'
                ? 'Establishing Live Audio Stream...'
                : 'Session Ready'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Low-latency bidirectional audio with Gemini 3.8 Live API
            </p>
          </div>

          {errorMessage && (
            <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300 text-left flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Live Conversation Highlights */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 max-h-40 overflow-y-auto text-left text-xs space-y-2">
          {transcripts.map((t, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-xl ${
                t.sender === 'assistant'
                  ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700'
                  : 'bg-blue-600 text-white ml-6'
              }`}
            >
              <span className="font-bold text-[10px] uppercase block mb-0.5 opacity-70">
                {t.sender === 'assistant' ? 'SRIT AI Assistant' : 'You'}
              </span>
              {t.text}
            </div>
          ))}
        </div>

        {/* Controls Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isMuted
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
            }`}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>{isMuted ? 'Unmute' : 'Mute Mic'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 transition-all cursor-pointer"
          >
            End Conversation
          </button>
        </div>
      </div>
    </div>
  );
};
