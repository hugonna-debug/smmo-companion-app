import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicLayout } from "./components/PublicLayout";
import { PublicOnlyRoute } from "./components/PublicOnlyRoute";
import { Toaster } from "./components/ui/sonner";
import { LayoutProvider } from "./contexts/LayoutContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import {
  BuffsPage,
  CollectionPage,
  DashboardPage,
  EquipmentPage,
  GuildManagement,
  GuildPage,
  LandingPage,
  LoginPage,
  MarketHelper,
  MarketPage,
  PersonalItemsPage,
  PvpAssistantPage,
  PvpPage,
  SettingsPage,
  SignupPage,
  // AiAdvisorPage,
  VaultPage,
  WatchlistPage,
  WorldBossPage,
} from "./pages";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable={false}>
        <LayoutProvider>
          <Toaster />
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route element={<PublicOnlyRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/pvp" element={<PvpPage />} />
                <Route path="/guild" element={<GuildPage />} />
                <Route path="/guild-management" element={<GuildManagement />} />
                <Route path="/bosses" element={<WorldBossPage />} />
                <Route path="/buffs" element={<BuffsPage />} />
                <Route path="/equipment" element={<EquipmentPage />} />
                <Route path="/market" element={<MarketPage />} />
                <Route path="/market-helper" element={<MarketHelper />} />
                <Route path="/items" element={<PersonalItemsPage />} />
                <Route path="/pvp-assistant" element={<PvpAssistantPage />} />
                {/* <Route path="/advisor" element={<AiAdvisorPage />} /> */}
                <Route path="/vault" element={<VaultPage />} />
                <Route path="/collection" element={<CollectionPage />} />
                <Route path="/watchlist" element={<WatchlistPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </LayoutProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
