import { useEffect, useState, useRef } from "react";
import useSocket from "../hooks/useSocket";

export default function Blah() {
  // pre joined state
  const [username, setUsername] = useState('')
  const [room, setRoom] = useState('JavaScript')
  const [isJoined, setIsJoined] = useState(false)

  // post joined state
  const [allMessages, setAllMessages] = useState([]);
  const [allUsers, setAllUsers] = useState([])
  const [message, setMessage] = useState([]);
  const chatMessages = useRef()
  const socket = useSocket();

  useEffect(() => {
    localStorage.setItem('messages', JSON.stringify(allMessages))
    localStorage.setItem('allUsers', JSON.stringify(allUsers))
    localStorage.setItem('room', JSON.stringify(room))
  }, [allMessages, allUsers, room])

  useEffect(() => {
    if (socket) {
      // Message from server
      socket.on('message', (message) => {
        setAllMessages(allMessages => [...allMessages, message]);
        chatMessages.current.scrollTop = chatMessages.current.scrollHeight
      });

      socket.on('roomUsers', ({ room, users }) => {
        setRoom(room)
        setAllUsers(users)
      });
    }
  }, [socket]);

  const sendMessage = (e) => {
    e.preventDefault();
    socket && socket.emit("chatMessage", message);
    setMessage('')
  }

  const joinRoom = (e) => {
    e.preventDefault();
    socket && socket.emit('joinRoom', { username, room }, (status) => {
      if (status) setIsJoined(true)
    });
  }

  const leaveRoom = () => {
    const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
    if (leaveRoom) {
      window.location.reload()
    }
  }

  return (
    <>
      {
        isJoined ? (
          <div className="chat-container" >
            <header className="chat-header">
              <h1><i className="fas fa-smile"></i> ChatCord</h1>
              <a id="leave-btn" className="btn" onClick={leaveRoom}>Leave Room</a>
            </header>
            <main className="chat-main">
              <div className="chat-sidebar">
                <h3><i className="fas fa-comments"></i> Room Name:</h3>
                <h2 id="room-name">{room}</h2>
                <h3><i className="fas fa-users"></i> Users</h3>
                <ul id="users">
                  {
                    allUsers.map((user, userI) => {
                      return (
                        <li key={`${user.id}_${userI}`}>{user.username}</li>
                      )
                    })
                  }
                </ul>
              </div>
              <div className="chat-messages" ref={chatMessages}>
                {
                  allMessages.map(({ username, time, text }) => {
                    return (
                      <div className="message" key={`${room}_${username}_${time}_${text}`}>
                        <p className="meta">
                          <span>{`${username} ${time}`}</span>
                        </p>
                        <p className="text">
                          {text}
                        </p>
                      </div>
                    )
                  })
                }
              </div>
            </main>
            <div className="chat-form-container">
              <form id="chat-form" onSubmit={sendMessage}>
                <input
                  id="msg"
                  type="text"
                  placeholder="Enter Message"
                  required
                  autoComplete="off"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
                <button className="btn"><i className="fas fa-paper-plane"></i>Send</button>
              </form>
            </div>
          </div>
        ) : (
          <div className="join-container">
            <header className="join-header">
              <h1><i className="fas fa-smile"></i>Chatty</h1>
            </header>
            <main className="join-main">
              <form onSubmit={joinRoom}>
                <div className="form-control">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    placeholder="Enter username"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <label htmlFor="room">Room</label>
                  <select name="room" id="room" value={room} onChange={e => setRoom(e.target.value)}>
                    <option value="JavaScript">JavaScript</option>
                    <option value="Python">Python</option>
                    <option value="PHP">PHP</option>
                    <option value="C#">C#</option>
                    <option value="Ruby">Ruby</option>
                    <option value="Java">Java</option>
                  </select>
                </div>
                <button type="submit" className="btn">Join Chat</button>
              </form>
            </main>
          </div>
        )
      }
    </>
  );
}
