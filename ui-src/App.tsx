import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

interface Sound {
  url: string;
  name: string;
  imageUrl?: string;
}

interface OpenMessage {
  intent: 'new' | 'edit' | 'play';
  sound: Sound;
}

function useDataFromWidget<T>() {
  const [data, setData] = useState<T | null>(null);

  useLayoutEffect(() => {
    const listener = (event: MessageEvent) => {
      setData(event.data.pluginMessage);
    };

    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);

  return data;
}

function App() {
  const data = useDataFromWidget<OpenMessage>();

  const { register, reset, handleSubmit } = useForm({
    defaultValues: {
      name: "",
      url: "",
      imageUrl: "",
    },
  });

  useEffect(() => {
    if (!data) return;

    // Put the data from the widget into the form:
    reset({ ...data.sound });

    // If we actually have a sound to play, then play the sound:
    if (data.intent === "play" && data.sound) {
      const audio = new Audio();
      audio.src = data.sound.url;
      audio.play();

      audio.addEventListener("error", () => {
        parent.postMessage(
          {
            pluginMessage: { type: "close" },
          },
          "*"
        );
      });

      audio.addEventListener("ended", () => {
        parent.postMessage(
          {
            pluginMessage: { type: "close" },
          },
          "*"
        );
      });
    }
  }, [data]);

  return (
    <form
      className="flex flex-col justify-between h-full mx-4 py-4"
      onSubmit={handleSubmit((values) => {
        parent.postMessage(
          {
            pluginMessage: {
              type: "addSound",
              payload: {
                ...values,
              },
            },
          },
          "*"
        );
      })}
    >
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Name
          <div className="mt-1">
            <input
              type="text"
              className="shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent block w-full sm:text-sm border border-gray-300 rounded-md py-1 px-2"
              placeholder="Duck sound"
              {...register("name", { required: true })}
            />
          </div>
        </label>

        <label className="block text-sm font-medium text-gray-700">
          Sound URL
          <div className="mt-1">
            <input
              type="text"
              className="shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent block w-full sm:text-sm border border-gray-300 rounded-md py-1 px-2"
              placeholder="www.example.com/example.mp3"
              {...register("url", { required: true })}
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
              className="shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent block w-full sm:text-sm border border-gray-300 rounded-md py-1 px-2"
              placeholder="www.example.com/example.png"
              {...register("imageUrl", { required: false })}
            />
          </div>
        </label>
      </div>
      <button
        className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-purple-500 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        type="submit"
      >
        Save Sound
      </button>
    </form>
  );
}

export default App;
