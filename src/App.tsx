import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { BranchProvider } from "@/contexts/BranchContext";
import Navbar from "@/components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import ChatBot from "@/components/ChatBot";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <BranchProvider>
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <AppRoutes />
              <ChatBot />
            </div>
          </BranchProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
