import React, {
  useEffect, useState, useRef, useCallback,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getAudioThunk, getAudioAC } from '../../../redux/actions/audioActions';
import socket from '../../../socket';
import useDebounce from '../../../Debounce/Debounce';

function Player({ nameCreater }) {
  const audioFromServer = useSelector((state) => state.audio);
  const user = useSelector((state) => (state.user));

  const dispatch = useDispatch();
  const clientAudio = new Audio();
  clientAudio.pause();
  clientAudio.addEventListener('loadeddata', (event) => {});

  let adminStop = false;
  function clientAudioStop() {
    clientAudio.pause();
    adminStop = false;
    clientAudio.src = null;
    clientAudio.currentTime = null;
  }
  const roomId = useParams();

  useEffect(() => {
    clientAudio.pause();
    dispatch(getAudioThunk(roomId.id));
  }, []);

  function showTime(m) {
    console.log(m);
    if (user?.userName !== nameCreater) {
      clientAudio.pause();
      clientAudio.src = m.path;
      clientAudio.currentTime = m.timecode;
      clientAudio.play();
    }
  }

  let stopCheck = true;
  const audio = new Audio();
  audio.addEventListener('loadeddata', (event) => {});

  function adminPlay(m) {
    let i = 0;
    let currentPlay = m[i][0];
    if (user.userName === nameCreater) {
      // eslint-disable-next-line prefer-destructuring
      audio.src = currentPlay;
      audio.play();
      setInterval(() => {
        if (audio.paused && stopCheck) {
          console.log('in if admin');
          // eslint-disable-next-line no-plusplus
          ++i;
          if (i > m.length - 1) {
            i = 0;
          }
          // eslint-disable-next-line prefer-destructuring
          currentPlay = m[i][0];
          audio.src = currentPlay;
          audio.play();
          socket.emit('next', { timecode: audio.currentTime, path: currentPlay });
        }
        if (!audio.paused) {
          socket.emit('sendTime', { timecode: audio.currentTime, path: currentPlay });
        }
      }, 100);
    }
  }

  function tracksForAll() {
    dispatch(getAudioThunk(roomId.id));
  }
  useEffect(() => {
    socket.on('next', showTime);
  }, [socket]);
  useEffect(() => {
    socket.on('time', showTime);
  }, [socket]);
  socket.on('stop', clientAudioStop);
  socket.on('tracksForAll', tracksForAll);

  const handleAudioNext = useDebounce(() => {
    console.log('in next');
    audio.pause();
  }, 200);

  function handleAudioStop() {
    stopCheck = false;
    audio.pause();
    socket.emit('stop', {});
  }

  useEffect(() => {
    socket.emit('time', { }); // При загрузке пользователь получает таймкод и адрес
  }, []);

  const handleTimecode = useDebounce(() => socket.emit('time', {}), 200);

  const handlePlaySound = useDebounce(() => {
    stopCheck = true;
    adminPlay(audioFromServer);
  }, 200);

  // function handlePlaySound() {
  //   stopCheck = true;
  //   adminPlay(audioFromServer);
  // }

  return (
    <div className="player-btn-group">
      {user.userName !== nameCreater
    && <button type="button" className="btn player-btn" onClick={handleTimecode}>Start</button>}
      {user?.userName === nameCreater && (
        <>
          <button type="button" className="btn player-btn" onClick={handlePlaySound}>Start</button>
          <button type="button" className="btn player-btn" onClick={handleAudioNext}>Next</button>
          <button type="button" className="btn player-btn" onClick={handleAudioStop}>Stop</button>
        </>
      )}
    </div>

  );
}

export default Player;
