// Import External Dependencies
import React, { useEffect } from "react";
import { stagger, useAnimate, usePresence } from "framer-motion";

// Import Internal Dependencies
// import { sendMessage } from "../../lib/chat/chat";
// import { useChat } from "../../hooks/useChat";
// import { useWallet } from "@solana/wallet-adapter-react";
// import { truncatePubkey } from "../../lib/user/user";
// import noPfp from "../../public/images/no_pfp.webp";
// import { PublicKey } from "@solana/web3.js";

function ChatComponent({ inputRef, isOpen }: { inputRef: any, isOpen: boolean }) {
  // const [input, setInput] = useState("");
  // const wallet = useWallet();

  // const { messages: chat, newMessagesCount, resetNewMessagesCount } = useChat();

  // const handleClick = async (e: any) => {
  //   e.preventDefault();
  //   if (wallet.publicKey && input.length) {
  //     await sendMessage(wallet.publicKey.toBase58(), input);
  //     setInput("");
  //   }
  // };

  // const timeAgo = (date: any) => {
  //   const now = Date.now();
  //   const diffInSeconds = Math.floor((now - date.getTime()) / 1000);

  //   if (diffInSeconds < 60) {
  //     return `${diffInSeconds} second${diffInSeconds >= 0 ? "s" : ""} ago`;
  //   } else if (diffInSeconds < 3600) {
  //     const diffInMinutes = Math.floor(diffInSeconds / 60);
  //     return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
  //   } else if (diffInSeconds < 86400) {
  //     const diffInHours = Math.floor(diffInSeconds / 3600);
  //     return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
  //   } else {
  //     const diffInDays = Math.floor(diffInSeconds / 86400);
  //     return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  //   }
  // };

  const [scope, animate] = useAnimate();
  const [isPresent, safeToRemove] = usePresence();

  // animation
  useEffect(() => {
    if (scope.current) {
      if (isPresent) {
        const enterAnimation = async () => {
          await animate(
            scope.current,
            { opacity: [0, 1], y: 0 },
            { duration: 0.1, delay: stagger(0.1) }
          );
        };
        enterAnimation();
      } else {
        const exitAnimation = async () => {
          await animate(
            scope.current,
            { opacity: 0, y: -100 },
            { duration: 0.1 }
          );
          if (safeToRemove) {
            safeToRemove();
          }
        };
        exitAnimation();
      }
    }
  }, [scope.current, isPresent]);

  return (
    <>
      {isOpen ?
        <div className={isOpen ? "h-full w-full block" : "hidden"}
        >
          <iframe
            src="https://emerald.widgetbot.io/channels/961173343879446578/1157280482652852245"
            allow="clipboard-write; fullscreen"
            height="100%"
            width="100%"
            className={`${isOpen ? null : "hidden !h-0"}`} >
          </iframe>
        </div>
        : null}
    </>
  );
}

export default ChatComponent;