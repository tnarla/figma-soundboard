import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./App.css";

interface Sound {
  url: string;
  name: string;
}

function App() {
  const [sound, setSound] = useState<Sound>();
  const [newSoundName, setNewSoundName] = useState("");
  const [newSoundUrl, setNewSoundUrl] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (sound) {
      play();
    }
  }, [sound]);

  useLayoutEffect(() => {
    window.onmessage = (event) => {
      setSound(event.data.pluginMessage);
    };
  }, []);

  function play() {
    var aud = audioRef.current;
    if (!aud) return;

    aud.play();

    aud.addEventListener("ended", () => {
      parent.postMessage(
        {
          pluginMessage: {
            type: "close",
          },
        },
        "*"
      );
    });
  }

  if (sound && sound.name === "new") {
    return (
      <div>
        <input
          aria-label="Name"
          placeholder="Name"
          onChange={(e) => setNewSoundName(e.target.value)}
        ></input>
        <input
          aria-label="URL"
          placeholder="URL"
          onChange={(e) => setNewSoundUrl(e.target.value)}
        ></input>

        <button
          onClick={() => {
            if (newSoundName && newSoundUrl) {
              parent.postMessage(
                {
                  pluginMessage: {
                    type: "addSound",
                    payload: { url: newSoundUrl, name: newSoundName },
                  },
                },
                "*"
              );
            }
          }}
        >
          Save Sound
        </button>
      </div>
    );
  }

  return (
    <div className="App">
      {sound && (
        <>
          <div>Playing sound: {sound.name}!</div>
          <audio ref={audioRef} id="audio" src={sound.url}></audio>
        </>
      )}
    </div>
  );
}

export default App;
