import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo<'reverb'>;
  }
}

if (typeof window !== 'undefined') {
  window.Pusher = Pusher;
  Pusher.logToConsole = process.env.NODE_ENV === 'development';
}

export function createEcho(token: string | null): Echo<'reverb'> {
  const echo = new Echo({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 443),
    forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
    enableStats: false,
    // Channel authorization for private channels (only when authenticated)
    ...(token && {
      channelAuthorization: {
        transport: 'ajax' as const,
        endpoint: `${process.env.NEXT_PUBLIC_API_URL}/broadcasting/auth`,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    }),
  });

  return echo;
}
