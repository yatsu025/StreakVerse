import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Leaderboard from "./pages/Leaderboard.tsx";
import Login from "./pages/Login.tsx";
import CharacterSelect from "./pages/CharacterSelect.tsx";
import NotFound from "./pages/NotFound.tsx";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const AppContent = () => {
  const { session, loading } = useAuth();

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const character = localStorage.getItem("streakverse_character");
    const hasCharacter = !!character;

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="text-primary animate-pulse font-display text-4xl font-black tracking-wider uppercase">
              Verifying<br /><span className="text-foreground">Identity</span>
            </div>
            <div className="w-48 h-1 bg-secondary rounded-full overflow-hidden mt-4">
              <div className="h-full bg-primary animate-progress-loading" />
            </div>
          </div>
        </div>
      );
    }

    if (!session) {
      return <Navigate to="/login" replace />;
    }

    if (!hasCharacter) {
      return <Navigate to="/choose-character" replace />;
    }

    return <>{children}</>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="text-primary animate-pulse font-display text-4xl font-black tracking-wider">
            STREAK<span className="text-foreground">VERSE</span>
          </div>
          <div className="w-48 h-1 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-progress-loading" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/choose-character" element={<ProtectedRoute><CharacterSelect /></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
