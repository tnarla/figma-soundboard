import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

interface Sound {
  url: string;
  name: string;
  imageUrl?: string;
}

function App() {
  const [sound, setSound] = useState<Sound>();
  const [newSoundName, setNewSoundName] = useState("");
  const [newSoundUrl, setNewSoundUrl] = useState("");
  const [newSoundImage, setNewSoundImage] = useState("");
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
      <div className="flex flex-col justify-between h-full mx-4 py-4">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Name
            <div className="mt-1">
              <input
                type="text"
                name="name"
                id="name"
                className="shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent block w-full sm:text-sm border border-gray-300 rounded-md py-1 px-2"
                placeholder="Duck sound"
                onChange={(e) => setNewSoundName(e.target.value)}
              />
            </div>
          </label>

          <label className="block text-sm font-medium text-gray-700">
            URL
            <div className="mt-1">
              <input
                type="text"
                name="url"
                id="url"
                className="shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent block w-full sm:text-sm border border-gray-300 rounded-md py-1 px-2"
                placeholder="www.example.com/example.mp3"
                onChange={(e) => setNewSoundUrl(e.target.value)}
              />
            </div>
          </label>

          <label className="block text-sm font-medium text-gray-700">
            <div className="flex justify-between">
              <span>Image URL</span>
              <span className="text-sm text-gray-500" id="email-optional">
                Optional
              </span>
            </div>
            <div className="mt-1">
              <input
                type="text"
                name="imageurl"
                id="imageurl"
                className="shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent block w-full sm:text-sm border border-gray-300 rounded-md py-1 px-2"
                placeholder="www.example.com/example.png"
                onChange={(e) => setNewSoundImage(e.target.value)}
              />
            </div>
          </label>
        </div>
        <button
          className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-purple-500 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => {
            if (newSoundName && newSoundUrl) {
              parent.postMessage(
                {
                  pluginMessage: {
                    type: "addSound",
                    payload: {
                      url: newSoundUrl,
                      name: newSoundName,
                      imageUrl: newSoundImage,
                    },
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
