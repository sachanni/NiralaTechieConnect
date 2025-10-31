import { useState, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import ChatPopup from './ChatPopup';

export default function ChatPopupManager() {
  const { openChats } = useChat();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // On mobile, only show the most recent chat
  const chatsToShow = isMobile && openChats.length > 0 ? [openChats[openChats.length - 1]] : openChats;

  return (
    <>
      {chatsToShow.map((chat, index) => (
        <ChatPopup
          key={chat.conversationId}
          chat={chat}
          position={index}
          isMobile={isMobile}
        />
      ))}
    </>
  );
}
