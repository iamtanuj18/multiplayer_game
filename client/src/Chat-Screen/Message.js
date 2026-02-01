import React from "react";

import "./chat.css";

export default function Message({ message: { user, text }, name }) {
  const sentByUser = user === name;

  return sentByUser ? (
    <div className="messageContainer justifyEnd">
      <p className="sentText pr-10">You</p>
      <div className="messageBox backgroundBlue">
        <p className="messageText colorWhite">{text}</p>
      </div>
    </div>
  ) : (
    <div className="messageContainer justifyStart">
      <p className="sentText pl-10">{user}</p>
      <div className="messageBox backgroundLight">
        <p className="messageText colorDark">{text}</p>
      </div>
    </div>
  );
}
