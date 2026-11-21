import React from "react";
import { Composition } from "remotion";
import { Listicle, W, H, FPS, TOTAL } from "./Listicle";
export const Root: React.FC = () => <Composition id="Listicle" component={Listicle} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />;
