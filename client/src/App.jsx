import { io } from "socket.io-client";
import { useState } from "react";
import Chat from "./Chat";
import "./App.css";
const token = localStorage.getItem("token");
const socket = io.connect("http://localhost:3001", {
  query: { token },
});
function App() {
  const [auth, setAuth] = useState();
  const [signup, setSignup] = useState();
  const [password, setPassword] = useState("");
  const [room, setRoom] = useState();
  const [userName, setUserName] = useState();
  const [chatIsShown, setChatIsShown] = useState(false);
  const [roomShown, setRoomShown] = useState(false);

  const roomInputChangeHandler = (event) => {
    setRoom(event.target.value);
  };

  const joinRoomHandler = () => {
    if (room) {
      socket.emit("join_room", room);
      setChatIsShown(true);
    }
  };

  const signupHandler = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:3001/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userName, password }),
    });
    const resData = await response.json();
    confirm(resData.message);
    setSignup(false);
  };
  const loginHandler = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:3001/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userName, password }),
    });
    const resData = await response.json();
    confirm(resData.message);
    localStorage.setItem("token", resData.token);
    setRoomShown(true);
    setAuth(false);
    setChatIsShown(false);
  };

  return (
    <div className="app">
      <div>
        {" "}
        <button
          onClick={() => {
            setSignup(true);
            setAuth(true);
          }}
        >
          signup
        </button>
        <button
          onClick={() => {
            setSignup(false);
            setAuth(true);
          }}
        >
          login
        </button>
      </div>
      {auth && signup ? (
        <form onSubmit={signupHandler}>
          <input
            type="text"
            name="userName"
            placeholder="userName"
            onChange={(event) => {
              setUserName(event.target.value);
            }}
          />
          <input
            type="text"
            name="password"
            placeholder="password"
            onChange={(event) => {
              setPassword(event.target.value);
            }}
          />
          <button>sign up</button>
        </form>
      ) : auth && !signup ? (
        <form onSubmit={loginHandler}>
          <input
            type="text"
            name="userName"
            placeholder="userName"
            onChange={(event) => {
              setUserName(event.target.value);
            }}
          />
          <input
            type="text"
            name="password"
            placeholder="password"
            onChange={(event) => {
              setPassword(event.target.value);
            }}
          />
          <button>login</button>
        </form>
      ) : null}
      {!auth && !chatIsShown && roomShown ? (
        <div className="joinChatContainer">
          <h3>Join Chat</h3>
          <input
            type="text"
            placeholder="your name"
            onChange={(event) => {
              setUserName(event.target.value);
            }}
          />
          <input
            type="text"
            placeholder="Enter Room ID !"
            onChange={roomInputChangeHandler}
          />
          <button onClick={joinRoomHandler}>Join A Room</button>
        </div>
      ) : !auth && chatIsShown ? (
        <Chat socket={socket} username={userName} room={room} />
      ) : null}
    </div>
  );
}

export default App;
