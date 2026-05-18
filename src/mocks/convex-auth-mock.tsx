import type React from "react";
import { resetPreviewData } from "./convex-react-mock";

const AUTH_KEY = "smmo_preview_logged_in";

export const ConvexAuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <>{children}</>;
};

export function useAuthActions() {
  return {
    signIn: async (provider: string, formData?: any) => {
      localStorage.setItem(AUTH_KEY, "true");
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("smmo_preview_update"));
      return { success: true };
    },
    signOut: async () => {
      localStorage.removeItem(AUTH_KEY);
      resetPreviewData();
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("smmo_preview_update"));
      return { success: true };
    },
  };
}
