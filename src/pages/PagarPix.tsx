import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, ChevronDown, ArrowLeft, Smartphone, User } from "lucide-react";
import logoEct from "@/assets/logo-ect.svg";
import { useNavigate } from "react-router-dom";

const PagarPix = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 horas em segundos
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [secureUrl, setSecureUrl] = useState<string>("");
  const [pixCode, setPixCode] = useState<string>("");
  const [amountBrl, setAmountBrl] = useState<number>(0);
  const navigate = useNavigate();
  // Detectar automaticamente a URL da API
  const getApiBase = () => {
    const envApiBase = (import.meta as any).env?.VITE_API_BASE;
    if (envApiBase) return envApiBase;
    
    // Se estiver em produção (sem localhost), usar o mesmo domínio
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return window.location.origin;
    }
    
    // Desenvolvimento local
    return "http://localhost:3001";
  };
  
  const API_BASE = getApiBase();
  const [trackingCode, setTrackingCode] = useState<string>("");

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Gerenciar estado de login
  useEffect(() => {
    console.log('PagarPix: useEffect executado');
    
    // Verificar se há dados de usuário no localStorage
    const storedUserName = localStorage.getItem('userName');
    const storedUserCPF = localStorage.getItem('userCPF');
    
    console.log('PagarPix: Dados do localStorage:', { storedUserName, storedUserCPF });
    
    if (storedUserName && storedUserCPF) {
      console.log('PagarPix: Usuário encontrado no localStorage, definindo como logado');
      setUserName(storedUserName);
      setIsLoggedIn(true);
    } else {
      console.log('PagarPix: Nenhum usuário encontrado no localStorage');
    }

    // Carregar dados do PIX gerado anteriormente
    setSecureUrl(localStorage.getItem('hydraPixSecureUrl') || "");
    const qrcode = localStorage.getItem('hydraPixQr') || "";
    setPixCode(qrcode);
    const amountStr = localStorage.getItem('hydraPixAmount') || "0";
    setAmountBrl(Number.parseInt(amountStr, 10) || 0);

    // Loading sequence
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      setShowContent(true);
    }, 1200);

    return () => clearTimeout(loadingTimer);
  }, []);

  const handleCopyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCode || "");
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  // Timer de 24 horas
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Polling do status do pagamento por tracking
  useEffect(() => {
    try {
      const last = (localStorage.getItem('lastTrackingQuery') || '').trim();
      if (last) setTrackingCode(last);
    } catch {}
    if (!API_BASE) return;
    const interval = setInterval(async () => {
      try {
        const code = (localStorage.getItem('lastTrackingQuery') || trackingCode || '').trim();
        if (!code) return;
        const res = await fetch(`${API_BASE}/api/payments/by-tracking/${encodeURIComponent(code)}`);
        if (!res.ok) return;
        const data = await res.json();
        const payments = Array.isArray(data?.payments) ? data.payments : [];
        const paidTarifa = payments.some((p: any) => String(p?.status || '').toLowerCase() === 'paid' && String(p?.category || '').toLowerCase() === 'tarifa');
        if (paidTarifa) {
          navigate('/pagamento-confirmado');
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [API_BASE, trackingCode, navigate]);

  // Formatar o tempo restante
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  console.log('PagarPix: Renderizando com estado:', { isLoggedIn, userName });
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Loading Screen */}
      {isLoading && (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-800">Gerando Pagamento Pix</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ 
        opacity: showContent ? 1 : 0, 
        transition: 'opacity 0.5s ease-in-out' 
      }}>
      {/* Header */}
      <header className="w-full bg-[#f5f3f0] border-b border-border">
        {/* Main header with beige background */}
        <div className="bg-[#f5f3f0] py-2 md:py-3">
          <div className="px-2 md:px-4 flex items-center justify-between">
            {/* Menu + Logo - Left side */}
            <div className="flex items-center gap-1 md:gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-600 hover:bg-gray-100 p-1 md:p-2 !bg-transparent focus:bg-transparent active:bg-transparent !text-gray-600"
                onClick={toggleMenu}
              >
                <Menu className={`w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 text-gray-600 ${isMenuOpen ? 'rotate-90' : 'rotate-0'}`} />
              </Button>
              <img 
                src={logoEct} 
                alt="Correios" 
                className="h-6 w-auto md:h-8"
              />
            </div>

            {/* User name - Right side */}
            {isLoggedIn && (
              <div className="flex items-center gap-2 text-blue-800">
                <User className="w-4 h-4" />
                <span className="font-medium text-sm md:text-base">{userName}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Yellow separator line */}
        <div className="w-full h-0.5 bg-yellow-400"></div>
      </header>

      {/* Menu Categories */}
      <div 
        className={`bg-[#F5F3F0] border-b border-gray-200 overflow-hidden transition-all duration-500 ease-in-out ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
          <h2 className="text-base md:text-lg font-bold text-gray-800 mb-2 md:mb-3">Rastreamento</h2>
          
          <div className="h-px bg-gray-300 mb-3 md:mb-4"></div>
          <div className="grid grid-cols-1 md:flex md:flex-wrap gap-1 md:gap-2 lg:gap-4">
            {[
              "Rastreamento de Objetos",
              "Rastreamento de Encomendas",
              "Rastreamento de Cartas",
              "Rastreamento de Pacotes",
              "Rastreamento de Sedex",
              "Rastreamento de PAC",
              "Rastreamento de Carta Registrada",
              "Rastreamento de Telegrama",
              "Rastreamento de Malote",
              "Rastreamento de Carga Expressa"
            ].map((category, index) => (
              <div key={index} className="py-1 md:py-2">
                <a 
                  href="#" 
                  className="text-gray-600 hover:text-gray-800 transition-colors duration-200 text-xs md:text-sm"
                >
                  {category}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-4 md:pt-8 pb-24 md:pb-28">
        <div className="flex justify-center">
          <div className="max-w-6xl w-full">
            {/* PIX Header */}
            <div className="flex items-center gap-3 mb-6 md:mb-8">
              <div className="p-2 md:p-3 rounded-lg">
                <img 
                  src="https://img.icons8.com/color/48/pix.png" 
                  alt="PIX" 
                  className="w-8 h-8 md:w-12 md:h-12"
                />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#4db6ac' }}>
                Pagar com PIX
              </h1>
            </div>

            {/* PIX Description */}
            <p className="text-gray-600 text-sm md:text-base mb-8 max-w-2xl">
              Pague com PIX a qualquer dia e hora! O pagamento é instantâneo, prático e concluído em poucos segundos, rápido e seguro.
            </p>

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* PIX Payment Section - Left side */}
              <div className="flex-1 max-w-2xl order-2 lg:order-1">
                {/* QR Code Section */}
                <div className="bg-white rounded-lg p-6 md:p-8 shadow-sm">
                  <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    {/* QR Code and PIX Code Section */}
                    <div className="flex flex-col items-center lg:items-start">
                      {/* QR Code */}
                      <div className="w-48 h-48 md:w-56 md:h-56 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200 mb-6 overflow-hidden">
                        {pixCode ? (
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(pixCode)}`}
                            alt="QR Code PIX"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="text-center">
                            <div className="text-gray-500 text-xs">QR CODE</div>
                          </div>
                        )}
                      </div>

                      {/* PIX Copia e Cola */}
                      <div className="w-full max-w-xs">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Código PIX (Copia e Cola):</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="flex-1 bg-white rounded-lg p-3 border border-gray-300 max-w-full overflow-x-auto">
                            <p className="text-xs text-gray-700 break-all">
                              {pixCode || '—'}
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className={`text-xs px-3 py-2 h-10 transition-all duration-300 ${
                              isCopied 
                                ? 'bg-green-100 border-green-500 text-green-700' 
                                : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                            }`}
                            onClick={handleCopyPixCode}
                          >
                            {isCopied ? (
                              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <img 
                                width="16" 
                                height="16" 
                                src="https://img.icons8.com/windows/32/copy.png" 
                                alt="copy"
                                className="w-4 h-4"
                              />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-4">
                        <img 
                          width="48" 
                          height="48" 
                          src="https://img.icons8.com/fluency-systems-regular/48/smartphone--v2.png" 
                          alt="smartphone--v2"
                          className="w-5 h-5"
                        />
                        <h3 className="font-semibold text-gray-900">Instruções</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <p className="text-sm md:text-base text-gray-700">
                            Abra o aplicativo do seu banco ou instituição financeira e acesse a opção PIX.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-0">
                          <img width="32" height="32" src="https://img.icons8.com/windows/32/qr-code.png" alt="qr-code" className="w-5 h-5" />
                          <h3 className="font-semibold text-gray-900">Escaneie o QR Code</h3>
                        </div>
                        <div className="flex items-start gap-3">
                          <p className="text-sm md:text-base text-gray-700">
                            Selecione a opção "Pagar com QR Code" e escaneie o código ao lado.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-0">
                          <img width="24" height="24" src="https://img.icons8.com/material-outlined/24/checkmark.png" alt="checkmark" className="w-5 h-5" />
                          <h3 className="font-semibold text-gray-900">Finalize seu pagamento</h3>
                        </div>
                        <div className="flex items-start gap-3 ml-0">
                          <p className="text-sm md:text-base text-gray-700">
                            Confirme as informações e conclua o pagamento.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchase Summary - Right side */}
              <div className="w-full lg:w-80 order-1 lg:order-2 mb-6 lg:mb-0">
                <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm lg:sticky lg:top-8">
                  <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">
                    Resumo da Compra
                  </h2>
                 
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm md:text-base">Encomenda Internacional</span>
                      <span className="font-semibold text-sm md:text-base">R$ {(amountBrl/100).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 md:pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-base md:text-lg font-semibold text-gray-900">Total</span>
                        <span className="text-lg md:text-xl font-bold text-blue-600">R$ {(amountBrl/100).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>
      {/* Footer */}
      <footer className="bg-yellow-400 py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Fale Conosco */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">Fale Conosco</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors text-sm">
                    <img src="https://rastreamento.correios.com.br/core/templates/bunker/img/rodape/monitor.png" alt="" className="w-4 h-4" />
                    <span>Registro de Manifestações</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors text-sm">
                    <img src="https://rastreamento.correios.com.br/core/templates/bunker/img/rodape/duvida.png" alt="" className="w-4 h-4" />
                    <span>Central de Atendimento</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors text-sm">
                    <img src="https://rastreamento.correios.com.br/core/templates/bunker/img/rodape/negocios.png" alt="" className="w-4 h-4" />
                    <span>Soluções para o seu negócio</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors text-sm">
                    <img src="https://rastreamento.correios.com.br/core/templates/bunker/img/rodape/duvida.png" alt="" className="w-4 h-4" />
                    <span>Suporte ao cliente com contrato</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors text-sm">
                    <img src="https://rastreamento.correios.com.br/core/templates/bunker/img/rodape/ouvidoria.png" alt="" className="w-4 h-4" />
                    <span>Ouvidoria</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors text-sm">
                    <img src="https://rastreamento.correios.com.br/core/templates/bunker/img/rodape/denuncia.png" alt="" className="w-4 h-4" />
                    <span>Denúncia</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Sobre os Correios */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">Sobre os Correios</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors text-sm">
                    <img src="https://rastreamento.correios.com.br/core/templates/bunker/img/rodape/identidade.png" alt="" className="w-4 h-4" />
                    <span>Identidade corporativa</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors text-sm">
                    <img src="https://rastreamento.correios.com.br/core/templates/bunker/img/rodape/educa%C3%A7%C3%A3o.png" alt="" className="w-4 h-4" />
                    <span>Educação e cultura</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors text-sm">
                    <img src="https://rastreamento.correios.com.br/core/templates/bunker/img/rodape/c%C3%B3digo%20%C3%A9tica.png" alt="" className="w-4 h-4" />
                    <span>Código de ética</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors text-sm">
                    <img src="https://rastreamento.correios.com.br/core/templates/bunker/img/rodape/Transpar%C3%AAncia.png" alt="" className="w-4 h-4" />
                    <span>Transparência e prestação de contas</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors text-sm">
                    <img src="https://rastreamento.correios.com.br/core/templates/bunker/img/rodape/cadeado.png" alt="" className="w-4 h-4" />
                    <span>Política de Privacidade e Notas Legais</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Outros Sites */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">Outros Sites</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors text-sm">
                    <img src="https://rastreamento.correios.com.br/core/templates/bunker/img/rodape/loja%20correios.png" alt="" className="w-4 h-4" />
                    <span>Loja online dos Correios</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-400 pt-6 text-center">
            <p className="text-gray-700 text-sm">
              © Copyright 2025 Correios
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PagarPix;
