// import React, { useState, useEffect, useRef } from "react";
// import "../Styles/ChatSection.css";

// function ChatSection({ sessionId, setSessionId }) {
//   const [inputText, setInputText] = useState("");
//   const [chatLog, setChatLog] = useState([]);
//   const chatContainerRef = useRef(null);

//   useEffect(() => {
//     if (chatContainerRef.current) {
//       chatContainerRef.current.scrollTop =
//         chatContainerRef.current.scrollHeight;
//     }
//   }, [chatLog]);

//   const handleInputChange = (e) => setInputText(e.target.value);

//   const handleSubmit = () => {
//     // Implement submission logic
//   };

//   return (
//     <div className="chat-section">
//       <div className="chat-messages" ref={chatContainerRef}>
//         {chatLog.map((message, index) => (
//           <div key={index} className="message">
//             {message.text}
//           </div>
//         ))}
//       </div>
//       <input type="text" value={inputText} onChange={handleInputChange} />
//       <button onClick={handleSubmit} disabled={!sessionId}>
//         Send
//       </button>
//     </div>
//   );
// }

// export default ChatSection;
