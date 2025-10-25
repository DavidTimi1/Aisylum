import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout";
import Chat from "./pages/Chat";
import Editor from "./pages/Editor";
import Language from "./pages/Language";
import NotFound from "./pages/NotFound";
import { PWAProvider } from "./contexts/pwa-context";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

const App = () => {
  // const { isInstalled, installPrompt } = usePWAContext();
  // const isInstallable = Boolean(installPrompt) || isInstalled;


  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PWAProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/editor" element={<Editor />} />
              <Route path="/language" element={<Language />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </PWAProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
