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
          width={100}
          height={130}
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
          width={100}
          height={130}
          fill="#8B5CF6"
          cornerRadius={8}
        >
          <WidgetText
            fontSize={12}
            width="fill-parent"
            height="fill-parent"
            horizontalAlignText="center"
            verticalAlignText="center"
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
