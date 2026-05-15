import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type LayoutMode = "normal" | "lshape";
export type DeadZonePosition = "top-right" | "top-left" | "bottom-right" | "bottom-left";

export interface LayoutConfig {
  mode: LayoutMode;
  deadZonePosition: DeadZonePosition;
  /** Width of the dead zone as percentage (20-80) */
  deadZoneWidth: number;
  /** Height of the dead zone as percentage (20-80) */
  deadZoneHeight: number;
}

const DEFAULT_CONFIG: LayoutConfig = {
  mode: "normal",
  deadZonePosition: "top-right",
  deadZoneWidth: 60,
  deadZoneHeight: 70,
};

const STORAGE_KEY = "smmo-layout-config";

function loadConfig(): LayoutConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_CONFIG, ...parsed };
    }
  } catch {
    // ignore
  }
  return DEFAULT_CONFIG;
}

interface LayoutContextType {
  config: LayoutConfig;
  setConfig: (config: Partial<LayoutConfig>) => void;
  isLShape: boolean;
}

const LayoutContext = createContext<LayoutContextType>({
  config: DEFAULT_CONFIG,
  setConfig: () => {},
  isLShape: false,
});

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<LayoutConfig>(loadConfig);

  const setConfig = useCallback((partial: Partial<LayoutConfig>) => {
    setConfigState((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // Keep body class in sync for CSS
  useEffect(() => {
    document.body.classList.toggle("lshape-mode", config.mode === "lshape");
    return () => document.body.classList.remove("lshape-mode");
  }, [config.mode]);

  return (
    <LayoutContext.Provider value={{ config, setConfig, isLShape: config.mode === "lshape" }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  return useContext(LayoutContext);
}
