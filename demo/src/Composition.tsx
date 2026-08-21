import {
  AbsoluteFill,
  Composition,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  Still,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const palette = {
  background: "#03091a",
  cyan: "#53d7ff",
  cyanSoft: "#a9efff",
  violet: "#9e7bff",
  coral: "#ff8b73",
  text: "#f7fbff",
  muted: "#a7b3c9",
  panel: "rgba(7, 18, 43, 0.82)",
  border: "rgba(125, 213, 255, 0.22)",
};

const ease = Easing.bezier(0.16, 1, 0.3, 1);

const progress = (frame: number, start: number, duration: number) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const SceneBackground: React.FC<{ opacity?: number }> = ({ opacity = 0.36 }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 360], [1.03, 1.09], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: palette.background }}>
      <Img
        src={staticFile("flow-background.png")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity,
          transform: `scale(${scale})`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 22% 35%, rgba(46, 175, 255, 0.16), transparent 34%), linear-gradient(90deg, rgba(3, 9, 26, 0.32), rgba(3, 9, 26, 0.86))",
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.2,
          backgroundImage:
            "linear-gradient(rgba(111, 207, 255, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(111, 207, 255, 0.12) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.22), transparent 76%)",
        }}
      />
    </AbsoluteFill>
  );
};

const BrandPill: React.FC = () => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 12,
      border: `1px solid ${palette.border}`,
      background: "rgba(7, 18, 43, 0.72)",
      borderRadius: 999,
      padding: "10px 18px",
      color: palette.cyanSoft,
      fontSize: 22,
      fontWeight: 650,
      letterSpacing: 0.2,
      boxShadow: "0 12px 40px rgba(0,0,0,0.22)",
    }}
  >
    <span
      style={{
        width: 11,
        height: 11,
        borderRadius: 99,
        background: palette.cyan,
        boxShadow: `0 0 20px ${palette.cyan}`,
      }}
    />
    Remotion Video Plugin · DeepSeek Harness
  </div>
);

const SceneFrame: React.FC<{
  children: React.ReactNode;
  duration: number;
  fadeOut?: boolean;
}> = ({ children, duration, fadeOut = true }) => {
  const frame = useCurrentFrame();
  const enter = progress(frame, 0, 18);
  const exit = fadeOut
    ? interpolate(frame, [duration - 16, duration], [1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  return (
    <AbsoluteFill
      style={{
        opacity: enter * exit,
        transform: `translateY(${interpolate(enter, [0, 1], [18, 0])}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const prompt = "Create a polished launch video for my plugin.";
  const typedLength = Math.floor(
    interpolate(frame, [18, 68], [0, prompt.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const titleIn = progress(frame, 4, 30);
  const cardIn = progress(frame, 12, 32);

  return (
    <SceneFrame duration={90}>
      <SceneBackground opacity={0.32} />
      <AbsoluteFill style={{ padding: "70px 84px", justifyContent: "space-between" }}>
        <BrandPill />
        <div style={{ maxWidth: 960 }}>
          <div
            style={{
              color: palette.text,
              fontSize: 82,
              lineHeight: 0.99,
              letterSpacing: -3.6,
              fontWeight: 760,
              opacity: titleIn,
              transform: `translateY(${interpolate(titleIn, [0, 1], [26, 0])}px)`,
            }}
          >
            Turn a prompt into a real MP4.
          </div>
          <div
            style={{
              marginTop: 34,
              width: 930,
              padding: "25px 28px",
              borderRadius: 22,
              border: `1px solid ${palette.border}`,
              background: palette.panel,
              boxShadow: "0 24px 80px rgba(0,0,0,0.34)",
              opacity: cardIn,
              transform: `scale(${interpolate(cardIn, [0, 1], [0.975, 1])})`,
            }}
          >
            <div style={{ color: palette.muted, fontSize: 18, marginBottom: 12 }}>
              USER PROMPT
            </div>
            <div
              style={{
                minHeight: 38,
                color: palette.text,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 27,
              }}
            >
              {prompt.slice(0, typedLength)}
              <span style={{ color: palette.cyan }}>|</span>
            </div>
          </div>
        </div>
        <div style={{ color: palette.muted, fontSize: 20 }}>
          Reproducible · preview-first · permission-aware
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};

const SkillScene: React.FC = () => {
  const frame = useCurrentFrame();
  const cardIn = progress(frame, 4, 30);
  const capabilities = ["Inspect", "Animate", "Preview", "Render"];

  return (
    <SceneFrame duration={90}>
      <SceneBackground opacity={0.3} />
      <AbsoluteFill style={{ padding: "70px 84px" }}>
        <BrandPill />
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 1030,
              padding: "42px 48px",
              borderRadius: 30,
              border: `1px solid ${palette.border}`,
              background:
                "linear-gradient(135deg, rgba(8, 22, 50, 0.94), rgba(14, 17, 45, 0.86))",
              boxShadow: "0 30px 110px rgba(0,0,0,0.38)",
              opacity: cardIn,
              transform: `translateY(${interpolate(cardIn, [0, 1], [34, 0])}px) scale(${interpolate(cardIn, [0, 1], [0.97, 1])})`,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ color: palette.muted, fontSize: 19 }}>SKILL LOADED</div>
                <div
                  style={{
                    color: palette.text,
                    marginTop: 8,
                    fontSize: 54,
                    fontWeight: 750,
                    letterSpacing: -2.2,
                  }}
                >
                  remotion-video
                </div>
              </div>
              <div
                style={{
                  alignSelf: "flex-start",
                  padding: "10px 16px",
                  borderRadius: 999,
                  background: "rgba(67, 219, 158, 0.14)",
                  color: "#7bf0bb",
                  fontSize: 20,
                  fontWeight: 700,
                }}
              >
                ● Ready
              </div>
            </div>
            <div
              style={{
                marginTop: 32,
                color: palette.muted,
                fontSize: 24,
                lineHeight: 1.45,
                maxWidth: 880,
              }}
            >
              A DeepSeek Harness skill for frame-driven React animation,
              preview checks, and verified Remotion rendering.
            </div>
            <div style={{ display: "flex", gap: 14, marginTop: 35 }}>
              {capabilities.map((item, index) => {
                const itemIn = progress(frame, 24 + index * 8, 18);
                return (
                  <div
                    key={item}
                    style={{
                      flex: 1,
                      padding: "18px 20px",
                      borderRadius: 16,
                      background: "rgba(81, 185, 255, 0.08)",
                      border: "1px solid rgba(110, 207, 255, 0.16)",
                      color: palette.cyanSoft,
                      fontSize: 22,
                      fontWeight: 650,
                      opacity: itemIn,
                      transform: `translateY(${interpolate(itemIn, [0, 1], [14, 0])}px)`,
                    }}
                  >
                    {index + 1}. {item}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};

const PipelineScene: React.FC = () => {
  const frame = useCurrentFrame();
  const stages = [
    { title: "Inspect", detail: "Project + assets" },
    { title: "Animate", detail: "Frame-driven React" },
    { title: "Preview", detail: "Studio + still" },
    { title: "Render", detail: "Verified MP4" },
  ];
  const line = progress(frame, 14, 62);

  return (
    <SceneFrame duration={100}>
      <SceneBackground opacity={0.26} />
      <AbsoluteFill style={{ padding: "65px 84px" }}>
        <BrandPill />
        <div style={{ marginTop: 58 }}>
          <div
            style={{
              color: palette.text,
              fontSize: 58,
              fontWeight: 750,
              letterSpacing: -2.4,
            }}
          >
            One workflow. Four verified stages.
          </div>
          <div style={{ position: "relative", marginTop: 58 }}>
            <div
              style={{
                position: "absolute",
                left: 90,
                right: 90,
                top: 65,
                height: 4,
                borderRadius: 4,
                background: "rgba(100, 190, 255, 0.13)",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${line * 100}%`,
                  borderRadius: 4,
                  background: `linear-gradient(90deg, ${palette.cyan}, ${palette.violet}, ${palette.coral})`,
                  boxShadow: "0 0 18px rgba(83, 215, 255, 0.55)",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 18, position: "relative" }}>
              {stages.map((stage, index) => {
                const itemIn = progress(frame, 10 + index * 14, 22);
                return (
                  <div
                    key={stage.title}
                    style={{
                      flex: 1,
                      minHeight: 190,
                      borderRadius: 24,
                      border: `1px solid ${palette.border}`,
                      background: "rgba(6, 16, 39, 0.92)",
                      padding: "28px 26px",
                      opacity: itemIn,
                      transform: `translateY(${interpolate(itemIn, [0, 1], [24, 0])}px)`,
                      boxShadow: "0 18px 54px rgba(0,0,0,0.25)",
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 15,
                        background: "rgba(83, 215, 255, 0.12)",
                        color: palette.cyan,
                        fontSize: 22,
                        fontWeight: 800,
                      }}
                    >
                      0{index + 1}
                    </div>
                    <div
                      style={{
                        marginTop: 21,
                        color: palette.text,
                        fontSize: 29,
                        fontWeight: 720,
                      }}
                    >
                      {stage.title}
                    </div>
                    <div style={{ marginTop: 8, color: palette.muted, fontSize: 18 }}>
                      {stage.detail}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 16,
              marginTop: 34,
              color: "#7bf0bb",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 19,
            }}
          >
            <span>✓ tests 2/2</span>
            <span>✓ HTTP 200</span>
            <span>✓ render verified</span>
          </div>
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};

const InstallCommand: React.FC<{ large?: boolean }> = ({ large = false }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 16,
      padding: large ? "20px 24px" : "15px 20px",
      borderRadius: 16,
      background: "rgba(4, 12, 31, 0.86)",
      border: `1px solid ${palette.border}`,
      color: palette.cyanSoft,
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      fontSize: large ? 23 : 18,
      boxShadow: "0 18px 58px rgba(0,0,0,0.28)",
    }}
  >
    <span style={{ color: palette.coral }}>$</span>
    dsh plugin --profile web add github:chenjie1129/remotion-video-plugin
  </div>
);

const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const titleIn = progress(frame, 2, 28);
  const commandIn = progress(frame, 20, 28);

  return (
    <SceneFrame duration={80} fadeOut={false}>
      <SceneBackground opacity={0.42} />
      <AbsoluteFill style={{ padding: "72px 84px", justifyContent: "center" }}>
        <div style={{ maxWidth: 1060 }}>
          <BrandPill />
          <div
            style={{
              marginTop: 38,
              color: palette.text,
              fontSize: 86,
              lineHeight: 0.98,
              fontWeight: 780,
              letterSpacing: -4,
              opacity: titleIn,
              transform: `translateY(${interpolate(titleIn, [0, 1], [24, 0])}px)`,
            }}
          >
            Create. Preview. Render.
          </div>
          <div
            style={{
              marginTop: 23,
              color: palette.muted,
              fontSize: 29,
              opacity: titleIn,
            }}
          >
            Programmatic video creation for DeepSeek Harness.
          </div>
          <div
            style={{
              marginTop: 40,
              opacity: commandIn,
              transform: `translateY(${interpolate(commandIn, [0, 1], [18, 0])}px)`,
            }}
          >
            <InstallCommand large />
          </div>
        </div>
      </AbsoluteFill>
    </SceneFrame>
  );
};

export const DemoVideo: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
      <Sequence durationInFrames={90} premountFor={fps}>
        <IntroScene />
      </Sequence>
      <Sequence from={90} durationInFrames={90} premountFor={fps}>
        <SkillScene />
      </Sequence>
      <Sequence from={180} durationInFrames={100} premountFor={fps}>
        <PipelineScene />
      </Sequence>
      <Sequence from={280} durationInFrames={80} premountFor={fps}>
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};

export const SocialPreview: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: palette.background,
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
    }}
  >
    <Img
      src={staticFile("flow-background.png")}
      style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.54 }}
    />
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(90deg, rgba(2, 8, 23, 0.97) 0%, rgba(2, 8, 23, 0.84) 52%, rgba(2, 8, 23, 0.18) 100%)",
      }}
    />
    <AbsoluteFill style={{ padding: "64px 72px", justifyContent: "center" }}>
      <div style={{ maxWidth: 820 }}>
        <BrandPill />
        <div
          style={{
            marginTop: 30,
            color: palette.text,
            fontSize: 72,
            lineHeight: 0.98,
            fontWeight: 780,
            letterSpacing: -3.5,
          }}
        >
          Create Remotion videos from DeepSeek Harness.
        </div>
        <div style={{ marginTop: 25, color: palette.muted, fontSize: 25 }}>
          Frame-driven animation · preview checks · verified renders
        </div>
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);

export const DemoPoster: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundColor: palette.background,
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
    }}
  >
    <SceneBackground opacity={0.46} />
    <AbsoluteFill style={{ padding: "78px 84px", justifyContent: "center" }}>
      <BrandPill />
      <div
        style={{
          marginTop: 36,
          color: palette.text,
          fontSize: 88,
          lineHeight: 0.98,
          fontWeight: 780,
          letterSpacing: -4,
          maxWidth: 980,
        }}
      >
        From prompt to verified MP4.
      </div>
      <div style={{ marginTop: 28, color: palette.muted, fontSize: 28 }}>
        A real Remotion render created with the plugin workflow.
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);

export const PluginDemoCompositions: React.FC = () => (
  <>
    <Composition
      id="RemotionVideoPluginDemo"
      component={DemoVideo}
      durationInFrames={360}
      fps={30}
      width={1280}
      height={720}
    />
    <Still id="SocialPreview" component={SocialPreview} width={1280} height={640} />
    <Still id="DemoPoster" component={DemoPoster} width={1280} height={720} />
  </>
);
