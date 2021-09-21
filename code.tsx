const { widget, ui } = figma;
const {
  AutoLayout,
  Rectangle,
  useSyncedState,
  useEffect,
  Text: WidgetText,
  Frame,
  Image: WidgetImage,
} = widget;

interface Sound {
  url: string;
  name: string;
  imageUrl?: string;
}

function Widget() {
  async function playSound(sound: Sound) {
    await new Promise<void>((resolve) => {
      figma.showUI(__html__, { visible: false });
      figma.ui.postMessage(sound);

      figma.ui.once("message", ({ type }) => {
        if (type === "close") {
          resolve();
        }
      });
    });
  }

  async function newSound(sound: Sound) {
    await new Promise<void>((resolve) => {
      figma.showUI(__html__);
      figma.ui.postMessage(sound);

      figma.ui.once("message", ({ type }) => {
        if (type === "addSound") {
          resolve();
        }
      });
    });
  }

  const [sounds, setSounds] = useSyncedState<Sound[]>("sounds", []);

  function chunkArray(array, size) {
    let result = [];
    for (let i = 0; i < array.length; i += size) {
      let chunk = array.slice(i, i + size);
      result.push(chunk);
    }
    return result;
  }

  useEffect(() => {
    figma.ui.onmessage = (message) => {
      if (message.type === "addSound") {
        setSounds([...sounds, message.payload]);
        figma.ui.close();
      }
      if (message.type === "close") {
        figma.ui.close();
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
      padding={16}
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
      <AutoLayout
        direction="vertical"
        horizontalAlignItems="start"
        verticalAlignItems="center"
        width="fill-parent"
        height={48}
      >
        <WidgetText
          fontSize={24}
          width="fill-parent"
          height="fill-parent"
          horizontalAlignText="left"
          verticalAlignText="center"
          fill="#000000"
          fontWeight="semi-bold"
        >
          Soundboard
        </WidgetText>
      </AutoLayout>

      {chunkArray(sounds, 2).map((soundPairs) => {
        return (
          <AutoLayout
            direction="horizontal"
            horizontalAlignItems="start"
            verticalAlignItems="center"
            width="fill-parent"
            height="hug-contents"
            spacing={20}
          >
            {soundPairs.map((sound) => {
              return (
                <AutoLayout
                  onClick={() => playSound(sound)}
                  width={100}
                  height={130}
                  fill={
                    colors[
                      sound.name
                        .split()
                        .reduce((a, b) => b.charCodeAt(0) + a, 0) %
                        colors.length
                    ]
                  }
                  cornerRadius={8}
                >
                  {sound.imageUrl ? (
                    <WidgetImage
                      width="fill-parent"
                      height="fill-parent"
                      src={sound.imageUrl}
                    ></WidgetImage>
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
              );
            })}
          </AutoLayout>
        );
      })}

      <AutoLayout
        onClick={() => newSound({ url: "", name: "new" })}
        direction="horizontal"
        horizontalAlignItems="center"
        verticalAlignItems="center"
        width="fill-parent"
        height={45}
        fill="#8B5CF6"
        cornerRadius={8}
      >
        <WidgetText
          fontSize={16}
          width="fill-parent"
          height="fill-parent"
          horizontalAlignText="center"
          verticalAlignText="center"
          fill="#ffffff"
          fontWeight="bold"
        >
          New Sound
        </WidgetText>
      </AutoLayout>
    </AutoLayout>
  );
}
widget.register(Widget);
