import React from "react";
import { Composition, registerRoot } from "remotion";
import { PhonicsSong } from "./Song";
import { FPS, W, H, TOTAL } from "./timing";

const Root: React.FC = () => React.createElement(Composition, { id: "PhonicsSong", component: PhonicsSong, durationInFrames: TOTAL, fps: FPS, width: W, height: H });
registerRoot(Root);
