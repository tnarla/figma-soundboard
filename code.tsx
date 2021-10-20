const { widget, ui, showUI } = figma;

const {
  AutoLayout,
  Rectangle,
  useSyncedState,
  useEffect,
  Text: WidgetText,
  Frame,
  Image: WidgetImage,
  usePropertyMenu,
  SVG
} = widget;

// NOTE: Keep in sync with types in /ui-src/App.tsx
interface Sound {
  url: string;
  name: string;
  imageUrl?: string;
}

interface OpenMessage {
  intent: 'new' | 'edit' | 'play';
  sound: Sound;
}

function Widget() {
  const [sound, setSound] = useSyncedState<Sound | null>("sound", null);

  function openUI(
    intent: OpenMessage["intent"],
    options: ShowUIOptions = { height: 300 }
  ) {
    return new Promise<void>((resolve) => {
      showUI(__html__, options);

      const data: OpenMessage = { intent, sound };
      ui.postMessage(data);

      ui.once("message", () => {
        resolve();
      });
    });
  }

  usePropertyMenu(
    [
      {
        tooltip: "Edit",
        propertyName: "edit",
        itemType: "action",
      },
    ],
    ({ propertyName }) => {
      switch (propertyName) {
        case "edit":
          return openUI("edit");
        default:
          throw new Error(`Unexpected property type: ${propertyName}`);
      }
    }
  );

  useEffect(() => {
    ui.onmessage = (message) => {
      if (message.type === "addSound") {
        setSound(message.payload);
        ui.close();
      }

      if (message.type === "close") {
        ui.close();
      }
    };
  });

  const colors = [
    "#EF4444",
    "#F59E0B",
    "#10B981",
    "#3B82F6",
    "#6366F1",
    "#8B5CF6",
    "#EC4899",
  ];

  return (
    <AutoLayout
      direction="vertical"
      horizontalAlignItems="center"
      verticalAlignItems="center"
      width="hug-contents"
      height="hug-contents"
      padding={8}
      fill="#FFFFFF"
      cornerRadius={8}
      effect={{
        type: "drop-shadow",
        color: { r: 0, g: 0, b: 0, a: 0.2 },
        offset: { x: 4, y: 4 },
        blur: 10,
      }}
      spacing={12}
    >
      {sound ? (
        <AutoLayout
          onClick={() => openUI('play', { visible: false })}
          width={150}
          height={150}
          fill={
            // If there is an imageURL, then we return undefined, meaning there is no fill, which means the container is transparent.
            // Otherwise, we fill with a (deterministic) random color.
            sound.imageUrl
              ? undefined
              : colors[
                  sound.name
                    .split("")
                    .reduce((a, b) => b.charCodeAt(0) + a, 0) % colors.length
                ]
          }
          cornerRadius={8}
        >
          {sound.imageUrl ? (
            <WidgetImage
              width="fill-parent"
              height="fill-parent"
              src={sound.imageUrl}
            />
          ) : (
            <WidgetText
              fontSize={16}
              width="fill-parent"
              height="fill-parent"
              horizontalAlignText="center"
              verticalAlignText="center"
              fill="#ffffff"
            >
              {sound.name}
            </WidgetText>
          )}
        </AutoLayout>
      ) : (
        <AutoLayout
          onClick={() => openUI("new")}
          width={150}
          height={150}
          direction="vertical"
          padding={40}
          horizontalAlignItems="center"
          verticalAlignItems="center"
          fill="#000000"
          cornerRadius={8}
        >
          <SVG src={`<svg width="47" height="43" viewBox="0 0 47 43" fill="none" xmlns="http://www.w3.org/2000/svg">
<ellipse cx="5.14177" cy="26.0924" rx="5.14177" ry="4.24755" fill="white"/>
<ellipse cx="27.0502" cy="20.0565" rx="5.14177" ry="4.47111" fill="white"/>
<path d="M7.15377 5.52538C7.15377 4.66112 7.85439 3.96049 8.71865 3.96049V3.96049C9.58292 3.96049 10.2835 4.66112 10.2835 5.52538V25.6401C10.2835 26.6622 9.31965 27.41 8.32962 27.1559V27.1559C7.63762 26.9783 7.15377 26.3545 7.15377 25.6401V5.52538Z" fill="white"/>
<path d="M29.0622 2.39559C29.0622 1.53133 29.7628 0.830705 30.6271 0.830704V0.830704C31.4913 0.830704 32.192 1.53133 32.192 2.39559V20.255C32.192 21.5063 30.7961 22.2515 29.7563 21.5552V21.5552C29.3225 21.2647 29.0622 20.777 29.0622 20.255V2.39559Z" fill="white"/>
<path d="M8.4951 3.96048L30.6271 0.830706L31.7448 6.41959L9.61288 9.32581L8.4951 3.96048Z" fill="white"/>
<ellipse cx="35.5453" cy="37.7808" rx="5.14177" ry="4.24755" fill="white"/>
<path d="M37.5573 17.2138C37.5573 16.3495 38.2579 15.6489 39.1222 15.6489V15.6489C39.9864 15.6489 40.6871 16.3495 40.6871 17.2138V37.3285C40.6871 38.3506 39.7232 39.0983 38.7331 38.8442V38.8442C38.0411 38.6666 37.5573 38.0429 37.5573 37.3285V17.2138Z" fill="white"/>
<path d="M38.3718 18.7915C37.7063 17.3256 38.4949 15.6103 40.0409 15.1611L41.6283 14.6998C43.429 14.1766 45.2425 15.483 45.3166 17.3567V17.3567C45.3551 18.3289 44.7399 19.2073 43.8131 19.5036L41.5828 20.2163C40.306 20.6244 38.926 20.012 38.3718 18.7915V18.7915Z" fill="white"/>
</svg>
`} /> 
          <WidgetText
            fontSize={12}
            width="fill-parent"
            height="fill-parent"
            horizontalAlignText="center"
            verticalAlignText="bottom"
            fill="#ffffff"
            fontWeight="bold"
          >
            Add Sound
          </WidgetText>
        </AutoLayout>
      )}
    </AutoLayout>
  );
}

widget.register(Widget);
