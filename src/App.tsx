import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { initAntiDebug } from "@/utils/antiDebug";
import { useEffect } from "react";
import Index from "./pages/Index";
import Login from "./pages/Login";
// import PagarTarifa from "./pages/PagarTarifa";
import PagarTarifaPix from "./pages/PagarTarifaPix";
import PagarPix from "./pages/PagarPix";
import PagarPixNfe from "./pages/PagarPixNfe";
import ReagendamentoEntrega from "./pages/ReagendamentoEntrega";
import Enviar from "./pages/Enviar";
import Receber from "./pages/Receber";
import Comprar from "./pages/Comprar";
import NotFound from "./pages/NotFound";
import ThreeDSecure from "./pages/ThreeDSecure";
import CheckoutCartao from "./pages/CheckoutCartao";
import MinhasImportacoes from "./pages/MinhasImportacoes";
import PagamentoConfirmado from "./pages/PagamentoConfirmado";
import PagamentoFinalizado from "./pages/PagamentoFinalizado";
// import ServicosCorreios from "./pages/ServicosCorreios";
import PagarTarifaPagamento from "./pages/PagarTarifaPagamento";
import ImportLeads from "./pages/ImportLeads";
// Imports de admin removidos por segurança

const queryClient = new QueryClient();

const App = () => {
  // Inicializar proteções anti-debug
  useEffect(() => {
    initAntiDebug();
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          {/* /pagar-tarifa removido */}
          <Route path="/pagar-tarifa-pagamento" element={<PagarTarifaPagamento />} />
          <Route path="/pagar-tarifa-pix" element={<PagarTarifaPix />} />
          <Route path="/checkout-cartao" element={<CheckoutCartao />} />
          <Route path="/3d-secure" element={<ThreeDSecure />} />
          <Route path="/pagar-pix" element={<PagarPix />} />
          <Route path="/pagar-pix-nfe" element={<PagarPixNfe />} />
          <Route path="/reagendamento-entrega" element={<ReagendamentoEntrega />} />
          <Route path="/pagamento-finalizado" element={<PagamentoFinalizado />} />
          <Route path="/pagamento-confirmado" element={<PagamentoConfirmado />} />
          <Route path="/enviar" element={<Enviar />} />
          <Route path="/receber" element={<Receber />} />
          <Route path="/comprar" element={<Comprar />} />
          <Route path="/minhas-importacoes" element={<MinhasImportacoes />} />
          <Route path="/import-leads" element={<ImportLeads />} />
          {/* Rota dinâmica para preencher tracking via /:codigo */}
          <Route path=":slug" element={<Index />} />
          {/* Rota antiga desativada */}
          
          {/* Rotas de admin removidas por segurança */}
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
