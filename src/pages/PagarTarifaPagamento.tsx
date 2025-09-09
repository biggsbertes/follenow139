import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, CreditCard, FileText, QrCode, ChevronDown, ArrowLeft, User } from "lucide-react";
import logoEct from "@/assets/logo-ect.svg";
import { useNavigate } from "react-router-dom";

const API_BASE = (import.meta as any).env?.VITE_API_BASE || "http://localhost:3001";

const PagarTarifaPagamento = () => {
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [amountBrl, setAmountBrl] = useState<number>(0);
  const [trackingCode, setTrackingCode] = useState<string>("");
  const [isPixLoading, setIsPixLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Gerenciar estado de login
  useEffect(() => {
    console.log('PagarTarifaPagamento: useEffect executado');
    
    // Verificar se há dados de usuário no localStorage
    const storedUserName = localStorage.getItem('userName');
    const storedUserCPF = localStorage.getItem('userCPF');
    
    console.log('PagarTarifaPagamento: Dados do localStorage:', { storedUserName, storedUserCPF });
    
    if (storedUserName && storedUserCPF) {
      console.log('PagarTarifaPagamento: Usuário encontrado no localStorage, definindo como logado');
      setUserName(storedUserName);
      setIsLoggedIn(true);
    } else {
      console.log('PagarTarifaPagamento: Nenhum usuário encontrado no localStorage');
    }

    // Carregar tracking e tarifa do lead
    const last = localStorage.getItem('lastTrackingQuery') || '';
    setTrackingCode(last);
    if (last) {
      fetch(`${API_BASE}/api/leads/search?tracking=${encodeURIComponent(last)}`)
        .then(async (res) => res.ok ? res.json() : Promise.reject('not found'))
        .then((data) => {
          const l = (data?.leads || [])[0];
          const cents = typeof l?.tarifaBrl === 'number' ? l.tarifaBrl : 0;
          setAmountBrl(cents);
        })
        .catch(() => setAmountBrl(0));
    }

    // Escutar mudanças no localStorage
    const handleStorageChange = (event: StorageEvent) => {
      console.log('PagarTarifaPagamento: Storage event recebido:', event);
      const newUserName = localStorage.getItem('userName');
      const newUserCPF = localStorage.getItem('userCPF');
      
      console.log('PagarTarifaPagamento: Novos dados do localStorage:', { newUserName, newUserCPF });
      
      if (newUserName && newUserCPF) {
        console.log('PagarTarifaPagamento: Definindo usuário como logado via storage event');
        setUserName(newUserName);
        setIsLoggedIn(true);
      } else {
        console.log('PagarTarifaPagamento: Definindo usuário como deslogado via storage event');
        setUserName(null);
        setIsLoggedIn(false);
      }
    };

    // Escutar eventos customizados
    const handleUserLogin = (event: CustomEvent) => {
      console.log('PagarTarifaPagamento: Evento userLogin recebido:', event.detail);
      setUserName(event.detail.userName);
      setIsLoggedIn(true);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogin', handleUserLogin as EventListener);
    
    console.log('PagarTarifaPagamento: Event listeners adicionados');

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleUserLogin as EventListener);
      console.log('PagarTarifaPagamento: Event listeners removidos');
    };
  }, []);

  console.log('PagarTarifaPagamento: Renderizando com estado:', { isLoggedIn, userName });
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
            <h1 className="text-2xl md:text-3xl font-bold text-blue-600 mb-6 md:mb-8 text-left px-4">
              Como você prefere pagar?
            </h1>

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Payment Options - Left side */}
              <div className="flex-1 max-w-2xl order-2 lg:order-1">
                <div className="space-y-3 md:space-y-4">
                  {/* Cartão de Crédito - DESABILITADO */}
                  <div className="bg-gray-100 rounded-lg p-4 md:p-6 border-2 border-gray-200 opacity-50 cursor-not-allowed">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="p-2 md:p-3 rounded-lg">
                        <img width="40" height="40" className="md:w-[50px] md:h-[50px] grayscale" src="https://img.icons8.com/ios/50/bank-card-back-side--v1.png" alt="bank-card-back-side--v1" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-500 text-base md:text-lg">Cartão de Crédito</h3>
                        <p className="text-gray-400 text-xs md:text-sm mt-1">Temporariamente indisponível</p>
                      </div>
                    </div>
                  </div>

                  {/* Boleto Bancário - DESABILITADO */}
                  <div className="bg-gray-100 rounded-lg p-4 md:p-6 border-2 border-gray-200 opacity-50 cursor-not-allowed">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="p-2 md:p-3 rounded-lg">
                        <img width="40" height="40" className="md:w-[48px] md:h-[48px] grayscale" src="https://cdn-icons-png.flaticon.com/512/25/25350.png" alt="boleto" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-500 text-base md:text-lg">Boleto Bancário</h3>
                        <p className="text-gray-400 text-xs md:text-sm mt-1">Pagamento somente à vista</p>
                      </div>
                    </div>
                  </div>

                  {/* PIX - DISPONÍVEL */}
                  <div
                    role="button"
                    tabIndex={0}
                    aria-disabled={isPixLoading}
                    className={`bg-white rounded-lg p-4 md:p-6 border-2 transition-all duration-200 ${
                      selectedPayment === "pix"
                        ? 'border-blue-500 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    } ${isPixLoading ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}`}
                    onClick={async () => {
                      if (isPixLoading) return;
                      setIsPixLoading(true);
                      try {
                        const res = await fetch(`${API_BASE}/api/payments/pix`, {
                          method: 'POST', headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ tracking: trackingCode })
                        });
                        const data = await res.json();
                        if (!res.ok || data?.error) throw new Error('Falha ao gerar PIX');
                        localStorage.setItem('hydraPixSecureUrl', data?.payment?.secureUrl || '');
                        localStorage.setItem('hydraPixQr', data?.payment?.qrcode || '');
                        localStorage.setItem('hydraPixAmount', String(amountBrl));
                        setSelectedPayment('pix');
                        navigate('/pagar-pix');
                      } catch (e) {
                        alert('Erro ao gerar PIX');
                      } finally {
                        setIsPixLoading(false);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="p-2 md:p-3 rounded-lg">
                        <img width="40" height="40" className="md:w-[48px] md:h-[48px]" src="https://img.icons8.com/color/48/pix.png" alt="pix" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-base md:text-lg">PIX</h3>
                        {!isPixLoading ? (
                          <p className="text-gray-500 text-xs md:text-sm mt-1">Pagamento instantâneo</p>
                        ) : (
                          <p className="text-gray-500 text-xs md:text-sm mt-1 inline-flex items-center gap-2">
                            <i className="fa-solid fa-spinner fa-spin"></i> Gerando PIX...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                
                  {/* Botão Voltar */}
                  <div className="mt-6 md:mt-8">
                    <Button 
                      variant="outline" 
                      className="w-full md:w-auto px-6 py-3 text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900"
                      onClick={() => navigate("/")}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Order Summary - Right side */}
              <div className="w-full lg:w-80 order-1 lg:order-2 mb-6 lg:mb-0">
                <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm lg:sticky lg:top-8">
                  <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4 break-all">
                    Resumo do Pedido #103210876
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

export default PagarTarifaPagamento;


