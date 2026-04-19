import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const useSocket = (paperId, onAnnotationAdded) => {
  const socketRef = useRef();

  useEffect(() => {
    if (!paperId) return;

    socketRef.current = io('http://localhost:5001');

    socketRef.current.emit('join_paper', paperId);

    socketRef.current.on('annotation_added', (newAnnotation) => {
      onAnnotationAdded(newAnnotation);
    });

    return () => {
      socketRef.current.emit('leave_paper', paperId);
      socketRef.current.disconnect();
    };
  }, [paperId]);

  return socketRef.current;
};

export default useSocket;
