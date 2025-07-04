import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

type UseSocketOptions<T> = {
  url: string;
  eventName: string;
};

export function useSocket<T>({ url, eventName }: UseSocketOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to the socket.io server
    const socket = io(url);

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    // Listen for the specified event and update data
    socket.on(eventName, (message: T) => {
      setData(message);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [url, eventName]);
