const { widget, ui } = figma;
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

interface Sound {
  url: string;
  name: string;
  imageUrl?: string;
}

function Widget() {
  const [sounds, setSounds] = useSyncedState<Sound[]>("sounds", []);

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
      figma.showUI(__html__, {height: 300});
      figma.ui.postMessage(sound);

      figma.ui.once("message", ({ type }) => {
        if (type === "addSound") {
          resolve();
        }
      });
    });
  }

  usePropertyMenu(
    [
      {
        tooltip: "Edit",
        propertyName: "edit",
        itemType: "action",
        icon: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.5858 3.58579C14.3669 2.80474 15.6332 2.80474 16.4143 3.58579C17.1953 4.36683 17.1953 5.63316 16.4143 6.41421L15.6214 7.20711L12.793 4.37868L13.5858 3.58579Z" fill="#ffffff"/><path d="M11.3787 5.79289L3.00006 14.1716V17H5.82849L14.2072 8.62132L11.3787 5.79289Z" fill="#ffffff"/></svg>',
      },
    ],
    async ({ propertyName }) => {
      if (propertyName === "edit") {
        await newSound({ url: "", name: "new" });
      }
    }
  );

  function chunkArray<T>(array: T[], size: number) {
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
      width={250}
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
