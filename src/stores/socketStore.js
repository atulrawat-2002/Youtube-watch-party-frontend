import { create } from "zustand";
import { devtools } from "zustand/middleware";


export const useSocketStore = create(devtools( (set) => {
    return {
        er: null,
        socket: null,
        videoId: null,
        participants: [],
        isPlaying: false,
        currentTime: 0,
        roomId: null,
        controls: false,
        currentUserRole: 'Participant',
        setSocket: (incomingSocket) => {
            set(state => ({
                ...state,
                socket: incomingSocket,
            }))

            incomingSocket.on("roomJoined", ({participants, videoId, isPlaying, currentTime, roomId, lastUpdate}) => {
                 const now = Date.now();
                    let realTime = currentTime;

                    if (isPlaying) {
                    const elapsed = (now - lastUpdate) / 1000;
                    realTime += elapsed;
            }
                
                set(state => ({
                    ...state,
                    participants: participants,
                    roomId: roomId,
                    videoId: videoId,
                    isPlaying: isPlaying,
                    currentTime: realTime
                }))
            })

            incomingSocket.on("participants-updated", (participantsArray) => {
                console.log(participantsArray)
                set(state => ({
                    ...state,
                    participants: participantsArray,
                }))
            })

            incomingSocket.on("error", ({message}) => {
                console.log(message)
                return;

            })

        },
        setIsPlaying: (value) => {
            set((state) => ({
                ...state,
                isPlaying: value
            }))
        },
        setCurrentTime: (time) => {
            set((state) => ({
                ...state,
                currentTime: time
            }))
        },
        setVideoId: (id) => {
            set((state) => ({
                ...state,
                videoId: id
            }))
        },
        setParticipants: (newParticipants) => {
            set(state => ({
                ...state,
                participants: newParticipants
            }))
        },
        setCurrentUserRole: (role) => {
            set(state => ({
                ...state,
                currentUserRole: role
            }))
        },
        setEr: (er) => {
            set(state => ({
                ...state,
                er: er
            }))
        }
    } 
} ))