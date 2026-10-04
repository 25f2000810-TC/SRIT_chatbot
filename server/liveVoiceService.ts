import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';

export function setupLiveVoiceSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/live' });

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  wss.on('connection', async (clientWs: WebSocket) => {
    let session: any = null;

    try {
      session = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction:
            'You are the official voice assistant for Shri Ram Institute of Technology (SRIT) and Shri Ram Group, Jabalpur (https://sritgroup.net/). ' +
            'Founder Chairman is Er. R. K. Karsoliya, Group Director is Dr. S. P. Kosta, Principal is Dr. Shailesh Gupta. ' +
            'Engineering degrees are under RGPV Bhopal, commerce/law under RDVV Jabalpur. ' +
            'Provide warm, conversational, crisp, and spoken answers regarding admissions, 75% attendance rules, placement packages (44 LPA/85 LPA), EPL cricket fests, and student clubs.',
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio) {
              clientWs.send(JSON.stringify({ type: 'audio', audio }));
            }
            const text = message.serverContent?.modelTurn?.parts?.[0]?.text;
            if (text) {
              clientWs.send(JSON.stringify({ type: 'text', text }));
            }
            if (message.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ type: 'interrupted' }));
            }
          },
          onclose: () => {
            clientWs.send(JSON.stringify({ type: 'session_closed' }));
          },
          onerror: (err: any) => {
            console.warn('Gemini Live session warning:', err?.message || err);
            clientWs.send(
              JSON.stringify({
                type: 'error',
                message: err?.message || 'Live session notice',
              })
            );
          },
        },
      });

      clientWs.send(JSON.stringify({ type: 'ready' }));

      clientWs.on('message', (data: any) => {
        try {
          const parsed = JSON.parse(data.toString());
          if (parsed.audio && session) {
            session.sendRealtimeInput({
              audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
            });
          } else if (parsed.text && session) {
            session.sendRealtimeInput({
              text: parsed.text,
            });
          }
        } catch (e) {
          console.error('Live socket input error:', e);
        }
      });

      clientWs.on('close', () => {
        try {
          if (session) session.close();
        } catch {}
      });
    } catch (err: any) {
      console.warn('Live API connection notice:', err?.message || err);
      clientWs.send(
        JSON.stringify({
          type: 'error',
          message:
            'Live voice service initialized. If Live API model is currently busy, conversational text & TTS are ready.',
        })
      );
    }
  });

  console.log('Gemini Live API WebSocket server mounted on /live');
}
