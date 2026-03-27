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
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const queryClient = new QueryClient();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("streakverse_logged_in") === "true");

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        localStorage.setItem("streakverse_logged_in", "true");
        setIsLoggedIn(true);
      } else if (event === "SIGNED_OUT") {
        localStorage.removeItem("streakverse_logged_in");
        setIsLoggedIn(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const hasCharacter = () => !!localStorage.getItem("streakverse_character");

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isLoggedIn) return <Navigate to="/login" replace />;
    if (!hasCharacter()) return <Navigate to="/choose-character" replace />;
    return <>{children}</>;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/choose-character" element={<CharacterSelect />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
