import { Outlet } from "react-router-dom";
import { useLayout, type DeadZonePosition } from "../contexts/LayoutContext";
import { BottomNav } from "./BottomNav";

/**
 * L-Shape Layout: content fills an L-shaped region around a transparent "dead zone"
 * where the user's game (SimpleMMO) is visible in split-screen mode.
 *
 * Layout regions:
 *   - "side" = tall narrow arm (primary scrollable content)
 *   - "strip" = wide short arm (secondary content / quick stats)
 *   - "dead" = empty transparent zone for the game
 *   - "nav" = bottom navigation bar
 */
export function LShapeLayout() {
  const { config } = useLayout();
  const { deadZonePosition, deadZoneWidth, deadZoneHeight } = config;

  const gridStyle = getGridStyle(deadZonePosition, deadZoneWidth, deadZoneHeight);
  const isDeadOnRight = deadZonePosition === "top-right" || deadZonePosition === "bottom-right";
  const isDeadOnTop = deadZonePosition === "top-right" || deadZonePosition === "top-left";

  return (
    <div className="l-shape-container" style={gridStyle}>
      {/* Side: the tall narrow arm — holds main page content */}
      <div className={`l-shape-side ${isDeadOnRight ? "border-r-0" : "border-l-0"}`}>
        <div className="l-shape-side-scroll">
          <Outlet />
        </div>
      </div>

      {/* Strip: the wide short arm — holds secondary quick-glance info */}
      <div className={`l-shape-strip ${isDeadOnTop ? "border-t-0" : "border-b-0"}`}>
        <div className="l-shape-strip-scroll">
          <div className="l-shape-strip-hint">
            <span className="text-[10px] text-muted-foreground">↕ Scroll side panel for full content</span>
          </div>
        </div>
      </div>

      {/* Dead zone — intentionally empty, game shows through here */}
      <div className="l-shape-deadzone" />

      {/* Bottom navigation — always at the very bottom */}
      <div className="l-shape-nav">
        <BottomNav />
      </div>
    </div>
  );
}

function getGridStyle(
  position: DeadZonePosition,
  dzWidth: number,
  dzHeight: number,
): React.CSSProperties {
  const sideWidth = `${100 - dzWidth}%`;
  const stripHeight = `${100 - dzHeight}%`;
  const dzW = `${dzWidth}%`;
  const dzH = `${dzHeight}%`;
  const navH = "52px";

  // CSS Grid areas:
  // 'side' = tall narrow arm (main content)
  // 'strip' = wide short arm (secondary)
  // 'dead' = transparent dead zone
  // 'nav' = bottom navigation bar

  switch (position) {
    case "top-right":
      // Side on left (full height minus nav), dead zone top-right, strip at bottom-right
      return {
        display: "grid",
        gridTemplateColumns: `${sideWidth} ${dzW}`,
        gridTemplateRows: `${dzH} calc(${stripHeight} - ${navH}) ${navH}`,
        gridTemplateAreas: `"side dead" "side strip" "nav nav"`,
        width: "100%",
        height: "100dvh",
      };
    case "top-left":
      // Side on right (full height minus nav), dead zone top-left, strip at bottom-left
      return {
        display: "grid",
        gridTemplateColumns: `${dzW} ${sideWidth}`,
        gridTemplateRows: `${dzH} calc(${stripHeight} - ${navH}) ${navH}`,
        gridTemplateAreas: `"dead side" "strip side" "nav nav"`,
        width: "100%",
        height: "100dvh",
      };
    case "bottom-right":
      // Side on left (full height minus nav), dead zone bottom-right, strip at top-right
      return {
        display: "grid",
        gridTemplateColumns: `${sideWidth} ${dzW}`,
        gridTemplateRows: `calc(${stripHeight} - ${navH}) ${dzH} ${navH}`,
        gridTemplateAreas: `"side strip" "side dead" "nav nav"`,
        width: "100%",
        height: "100dvh",
      };
    case "bottom-left":
      // Side on right (full height minus nav), dead zone bottom-left, strip at top-right
      return {
        display: "grid",
        gridTemplateColumns: `${dzW} ${sideWidth}`,
        gridTemplateRows: `calc(${stripHeight} - ${navH}) ${dzH} ${navH}`,
        gridTemplateAreas: `"strip side" "dead side" "nav nav"`,
        width: "100%",
        height: "100dvh",
      };
  }
}
