import { useEffect, useRef, useState } from "react";
import "./youtubePlayer.css";
import { useSocketStore } from "../stores/socketStore";
import { useParams } from "react-router-dom";

export default function YouTubePlayer({ videoId, controls }) {
  const [duration, setDuration] = useState(0);
  const [videoTiming, setVideoTiming] = useState(0);    // change
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const { roomId } = useParams();
  const { socket, isPlaying, currentTime, setIsPlaying, setCurrentTime } = useSocketStore();
  const [userRole, setUserRole] = useState('Participant');

  function handlePlay() {
    const time = playerRef?.current?.getCurrentTime();
    socket.emit("play", { time, roomId });
  }

  function handlePause() {
    if (!playerRef.current) return;

    const time = playerRef?.current?.getCurrentTime();

    socket.emit("pause", { roomId, time });
  }

  function handleSeek(newTime) {
    socket.emit("seek", { roomId, time: newTime });
  }

  if (socket) {
    socket.emit("getRole", roomId)
    socket.on("getRole", (role) => {
      setUserRole(role)
    })

    socket.on("pause", ({ time }) => {
    if (!playerRef.current) return;

    playerRef.current?.seekTo(time, true);
    playerRef.current?.pauseVideo();
    const currentTime = playerRef.current?.getCurrentTime();
    setCurrentTime(currentTime);
    setIsPlaying(false);
    // socket.emit("getCurrentTime", {roomId, currentTime})
  });

  socket.on("play", ({ time }) => {
    if (!playerRef.current) return;

    playerRef.current?.seekTo(time, true);
    playerRef.current?.playVideo();
    const currentTime = playerRef.current?.getCurrentTime();
    setCurrentTime(currentTime);
    setIsPlaying(true);
    // socket.emit("getCurrentTime", {roomId, currentTime})
  });

  socket.on("seek", ({ time }) => {
    if (!playerRef.current) return;
    playerRef.current?.seekTo(time, true);
    const currentTime = playerRef.current?.getCurrentTime();
    setCurrentTime(currentTime);
    setVideoTiming(time);
    // socket.emit("getCurrentTime", {roomId, currentTime})
  });
  }

  useEffect(() => {


    // if(!playerRef.current) return;
    // if(!socket) return;
    if(!videoId) return;
    // If API already loaded
    if (window.YT && window.YT.Player) {
      createPlayer();
      return;
    }

    // Load script if not loaded
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      createPlayer();
    };

    function createPlayer() {
      playerRef.current = new window.YT.Player(containerRef.current, {
        height: "390",
        width: "650",
        videoId,
        playerVars: {
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          autoplay: isPlaying,
        },
        events: {
          onReady: (event) => {
            playerRef.current = event.target;
            setDuration(event.target.getDuration());
            if (isPlaying === true) {
              playerRef.current.seekTo(currentTime + 15, true);
            }
          },
        },
      });
    }
  }, [videoId]);

  if(!videoId) {
    return<>

      <div id="frame-placeHolder" >

        Your video will appear here

      </div>

    </>
  }

  return (
    <>
      <div className="frame-container" style={{ position: "relative" }}>
        <div className="video-container" ref={containerRef}></div>

        <div
          style={{
            position: "absolute",
            border: "1px solid white",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 10,
          }}
        />
      </div>
      
          {
            (controls || userRole === 'Moderator' ) && <div id="host-controls" className="host-controls" >
              
          <input
          className="seeking-input"
        title="Seek Video"
        type="range"
        min="0"
        max={duration}
        step="0.1"
        value={videoTiming}
        onChange={(e) => {
          setVideoTiming(Number(e.target.value)); // move slider visually
        }}
        onMouseUp={(e) => {
          const newTime = Number(e.target.value);
          socket.emit("seek", { roomId, time: newTime });
        }}
      />
      <div className="player-actions">
        <button title="Play Video" onClick={handlePlay}> Play </button>
        <button title="pause Video" onClick={handlePause}> Pause</button>
      </div>
            </div>
          }

    </>
  );
}
