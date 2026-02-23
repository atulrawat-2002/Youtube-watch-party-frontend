import { useEffect, useRef, useState } from "react";
import YouTubePlayer from "../components/YouTubePlayer";
import "./room.css";
import { io } from "socket.io-client";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSocketStore } from "../stores/socketStore";
import { extractVideoId } from "../utils/extractVideoId";

function Room() {
  const roomId = useParams();
  const [videoURL, setVideoURL] = useState("");
  const navigate = useNavigate();
  const { socket, participants, videoId, setVideoId, setParticipants } = useSocketStore();
  const location = useLocation();
  const { controls } = location?.state;

  function handleLeave() {
    navigate("/");
  }

  function handleChangeVideo() {
    if (!socket) {
      return;
    }

    const id = extractVideoId(videoURL);

    socket.emit("changeVideo", {
      videoId: id,
      roomId: roomId?.roomId,
    });
  }

  function handleRemove(targetSocketId) {
    socket.emit("remove-user", {
      roomId,
      targetSocketId,
    });
  }

  function handleMakeModerator(targetSocketId) {
    socket.emit("make-moderator", { roomId, targetSocketId });
}

  useEffect(() => {
  if (!socket) return;

  const handleChangeVideo = ({ videoId }) => {
    setVideoId(videoId);
  };

  const handleRemoved = () => {
    alert("You were removed from the room");
    navigate("/");
  };

  const handleParticipantsUpdate = (participantsArray) => {
    setParticipants(participantsArray); // or set in Zustand
  };

  socket.on("changeVideoSuccess", handleChangeVideo);
  socket.on("removed", handleRemoved);
  socket.on("participants-updated", handleParticipantsUpdate);

  return () => {
    socket.off("changeVideoSuccess", handleChangeVideo);
    socket.off("removed", handleRemoved);
    socket.off("participants-updated", handleParticipantsUpdate);
  };
}, [socket, videoId]); // run once per socket

  return (
    <>
      <div>
        <header>
          <h2 id="roomID" > RoomId : <span  > {roomId?.roomId} </span> </h2>
          {controls && (
            <div className="host-actions">
              <input
                value={videoURL}
                onChange={(e) => setVideoURL(e.target.value)}
                placeholder="Enter URL for video"
                type="text"
              />
              <button onClick={() => handleChangeVideo(videoURL)}>
                Change Video
              </button>
            </div>
          )}
          <div className="room-actions">
            <button
              onClick={() => {
                navigator.clipboard.writeText(roomId.roomId);
              }}
            >
              Copy RoomId
            </button>
            <button onClick={handleLeave}> Leave </button>
          </div>
        </header>

        <div className="video-frame">
          <YouTubePlayer controls={controls} videoId={videoId} />
        </div>

        <div className="participants">
          <h2> Participants ({participants.length})</h2>

          {Array.from(participants.values()).map((participant) => {
            return (
              <div
                key={participant.username}
                id={participant}
                className="participant"
              >
                <div  > {participant.username} </div>

                {controls && participant.role !== "Host" && (
                  <div>
                    <button title="Remove Participant" onClick={() => handleRemove(participant.socketId)}>
                      
                      Remove
                    </button>
                    { participant.role !== 'Moderator' && <button
                      onClick={() => handleMakeModerator(participant.socketId)}
                      title="Make It Moderator"
                    >
                      
                      Make Moderator
                    </button>}
                  </div>
                )}

                <div  style={{
                    color: participant.role === 'Host' ? 'lime' : "#0c62ed",
                    fontWeight: '500'
                }} > {participant.role} </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default Room;
