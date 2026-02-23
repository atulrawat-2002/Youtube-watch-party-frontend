import { useState } from "react";
import { axiosClient } from "../configs/axiosConfig";
import "./landingPage.css";
import { useNavigate } from "react-router-dom";
import { useSocketStore } from "../stores/socketStore";
import { io } from "socket.io-client";

function Landing() {
  const [name, setName] = useState("");
  const [roomLink, setRoomLink] = useState("");
  const { socket, setSocket, currentTime } = useSocketStore();
  const navigate = useNavigate();

  async function handleRoomCreation() {
    if (!name) {
        return;
    }
    const response = await axiosClient.post("/api/rooms/create", {
      username: name,
    });
    const { roomId, joinLink } = response?.data;

    
    handleRoomJoin(roomId, 'Host', 0);
  }

  async function handleRoomJoin(roomId, role) {
    
    if (!roomId || !name) {
        alert("Please provide details")
        return;
    }
    const response = io(import.meta.env.VITE_BACKEND_URL, {
        auth: {
            roomId: roomId,
            username: name,
            role,
            time: currentTime,
        }
    });
    if(!response) return;
    setSocket(response);
    navigate(`/room/${roomId}`, {
        state: {
            controls: role === 'Participant' ? false : true
        }
    });
  }

  return (
    <>
      <div className="landing-page-container">
        <header>
          <h1> YouTube Watch Party </h1>
          <h3> Create A Room or Join With a Link </h3>
        </header>

        <div id="input-container" className="input-container">
          <label htmlFor="name">Your name</label>
          <input
            autoFocus={true}
            placeholder="type username here"
            value={name}
            type="text"
            id="name"
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={handleRoomCreation}> Create Room </button>
        </div>

        <div id="input-container" className="input-container">
          <label htmlFor="Room Id"> Room Link </label>
          <input
            placeholder="Paste room id here"
            value={roomLink}
            type="text"
            id="room"
            onChange={(e) => setRoomLink(e.target.value)}
          />
          <button onClick={() => handleRoomJoin(roomLink, 'Participant')}> Join Room </button>
        </div>
      </div>
    </>
  );
}

export default Landing;
