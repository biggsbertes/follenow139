import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, CheckCircle, FileText, AlertCircle } from "lucide-react";
import logoEct from "@/assets/logo-ect.svg";

const PagamentoConfirmado = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showStatus, setShowStatus] = useState(false);
  const [showNfePayment, setShowNfePayment] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userCPF, setUserCPF] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const steps = [
    {
      title: "Recebemos seu Pagamento",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
      borderColor: "border-green-200"
    },
    {
              title: "Erro, ao gerar Nota Fiscal eletrônica (NF-e)",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      borderColor: "border-blue-200"
    },
    {
      title: "Erro, ao gerar Nota Fiscal eletrônica (NF-e)",
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      borderColor: "border-red-200"
    }
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Gerenciar estado de login e buscar informações do usuário
  useEffect(() => {
    console.log('PagamentoConfirmado: useEffect executado');
    
    // Verificar se há dados de usuário no localStorage
    const storedUserName = localStorage.getItem('userName');
    const storedUserCPF = localStorage.getItem('userCPF');
    
    console.log('PagamentoConfirmado: Dados do localStorage:', { storedUserName, storedUserCPF });
    
    if (storedUserName && storedUserCPF) {
      console.log('PagamentoConfirmado: Usuário encontrado no localStorage, definindo como logado');
      setUserName(storedUserName);
      setUserCPF(storedUserCPF);
      setIsLoggedIn(true);
      
      // Buscar informações adicionais da API
      const fetchUserInfo = async () => {
        try {
          const response = await fetch(`/api/cpf?cpf=${storedUserCPF}`, {
            method: 'GET',
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('PagamentoConfirmado: Dados da API:', data);
            
            // Usar o nome completo da API em vez do nome reduzido do localStorage
            if (data.Nome) {
              setUserName(data.Nome);
              console.log('PagamentoConfirmado: Nome completo definido:', data.Nome);
            }
            
            if (data.Email) {
              setUserEmail(data.Email);
            }
            if (data.Telefone && data.Telefone !== 'Não informado') {
              setUserPhone(data.Telefone);
            }
          }
        } catch (error) {
          console.error('PagamentoConfirmado: Erro ao buscar informações da API:', error);
        }
      };
      
      fetchUserInfo();
    } else {
      console.log('PagamentoConfirmado: Nenhum usuário encontrado no localStorage');
    }

    // Escutar mudanças no localStorage
    const handleStorageChange = (event: StorageEvent) => {
      console.log('PagamentoConfirmado: Storage event recebido:', event);
      const newUserName = localStorage.getItem('userName');
      const newUserCPF = localStorage.getItem('userCPF');
      
      console.log('PagamentoConfirmado: Novos dados do localStorage:', { newUserName, newUserCPF });
      
      if (newUserName && newUserCPF) {
        console.log('PagamentoConfirmado: Definindo usuário como logado via storage event');
        setUserName(newUserName);
        setUserCPF(newUserCPF);
        setIsLoggedIn(true);
      } else {
        console.log('PagamentoConfirmado: Definindo usuário como deslogado via storage event');
        setUserName(null);
        setUserCPF(null);
        setUserEmail(null);
        setUserPhone(null);
        setIsLoggedIn(false);
      }
    };

    // Escutar eventos customizados
    const handleUserLogin = (event: CustomEvent) => {
      console.log('PagamentoConfirmado: Evento userLogin recebido:', event.detail);
      setUserName(event.detail.userName);
      setUserCPF(event.detail.cpfNumbers);
      setIsLoggedIn(true);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogin', handleUserLogin as EventListener);
    
    console.log('PagamentoConfirmado: Event listeners adicionados');

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleUserLogin as EventListener);
      console.log('PagamentoConfirmado: Event listeners removidos');
    };
  }, []);

  // Loading animation com status
  useEffect(() => {
    const stepTimers = [
      setTimeout(() => setCurrentStep(1), 2000), // 2s para o primeiro status
      setTimeout(() => setCurrentStep(2), 4000), // 2s para o segundo status
      setTimeout(() => setShowError(true), 6000), // 2s para mostrar o erro
      setTimeout(() => {
        setIsLoading(false);
        setShowNfePayment(true);
        setShowModal(true); // Mostra o modal após o carregamento
      }, 8000) // 2s após o erro, mostra a página de pagamento NF-e
    ];

    return () => {
      stepTimers.forEach(timer => clearTimeout(timer));
    };
  }, []);

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  // Função para formatar a data atual
  const formatCurrentDate = () => {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  console.log('PagamentoConfirmado: Renderizando com estado:', { isLoggedIn, userName, userCPF, userEmail, userPhone });
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Loading Screen com Status */}
      {isLoading && (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-800">
              {currentStep === 0 && "Processando Pagamento"}
              {currentStep === 1 && "Recebemos seu Pagamento"}
              {currentStep === 2 && "Erro, ao gerar Nota Fiscal eletrônica (NF-e)"}
            </p>
            {currentStep === 2 && (
              <p className="text-sm text-red-600 mt-2">
                Não foi possível gerar a nota fiscal eletrônica.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Página de Pagamento NF-e */}
      {showNfePayment && (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          {/* Header */}
          <header className="w-full bg-[#f5f3f0] border-b border-border">
            <div className="bg-[#f5f3f0] py-2 md:py-3">
              <div className="px-3 md:px-4 flex items-center justify-between">
                {/* Menu + Logo - Left side */}
                <div className="flex items-center gap-2 md:gap-4">
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
                  "Rastreamento de Documentos",
                  "Rastreamento de Pacotes",
                  "Rastreamento de Encomendas Internacionais",
                  "Rastreamento de Encomendas Nacionais",
                  "Rastreamento de Encomendas Expressas",
                  "Rastreamento de Encomendas Prioritárias",
                  "Rastreamento de Encomendas Econômicas",
                  "Rastreamento de Encomendas Registradas",
                  "Rastreamento de Encomendas Simples",
                  "Rastreamento de Encomendas com Aviso de Recebimento",
                  "Rastreamento de Encomendas com Valor Declarado",
                  "Rastreamento de Encomendas com Seguro",
                  "Rastreamento de Encomendas com Código de Barras",
                  "Rastreamento de Encomendas com QR Code",
                  "Rastreamento de Encomendas com NFC",
                  "Rastreamento de Encomendas com Bluetooth",
                  "Rastreamento de Encomendas com GPS"
                ].map((item, index) => (
                  <span key={index} className="text-sm text-gray-600 hover:text-gray-800 cursor-pointer">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Página de Pagamento NF-e */}
          <main className="px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
                <div className="text-center mb-8">
                  <h1 className="text-2xl md:text-3xl font-bold text-[#00416b] mb-2">
                    Pagamento da Nota Fiscal Eletrônica
                  </h1>
                  <p className="text-gray-600">
                    Para finalizar o processo, é necessário pagar a taxa da NF-e
                  </p>
                </div>

                {/* Informações da NF-e */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Informações da NF-e</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Número da NF-e:</span>
                        <span className="font-medium">586401176</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Data de Emissão:</span>
                        <span className="font-medium">{formatCurrentDate()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valor da NF-e:</span>
                        <span className="font-medium text-green-600">R$ 25,80</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium text-orange-600 animate-pulse">Aguardando Regularização</span>
                      </div>
                    </div>
                  </div>

                  {isLoggedIn && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Informações do Cliente</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nome:</span>
                          <span className="font-medium">{userName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">CPF:</span>
                          <span className="font-medium">{userCPF?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}</span>
                        </div>
                        {userEmail && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium">{userEmail}</span>
                          </div>
                        )}
                        {userPhone && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Telefone:</span>
                            <span className="font-medium">{userPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Método de Pagamento */}
                <div className="mb-8">
                  <h3 className="font-semibold text-gray-900 mb-4">Método de pagamento:</h3>
                  <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4">
                                          <div className="flex items-center gap-3">
                        <div className="w-12 h-12 flex items-center justify-center">
                          <img 
                            src="https://img.icons8.com/?size=192&id=Dk4sj0EM4b20&format=png" 
                            alt="PIX" 
                            className="w-10 h-10"
                          />
                        </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">PIX</h4>
                        <p className="text-sm text-gray-600">Pagamento instantâneo</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resumo do Pagamento */}
                <div className="bg-blue-50 rounded-lg p-4 mb-8">
                  <h3 className="font-semibold text-gray-900 mb-3">Resumo do Pagamento</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valor da NF-e:</span>
                                              <span className="font-medium">R$ 25,80</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxa de processamento:</span>
                      <span className="font-medium">R$ 2,50</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">Total a pagar:</span>
                        <span className="font-bold text-lg text-blue-600">R$ 28,30</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botão de Ação */}
                <div className="flex justify-center">
                  <Button
                    onClick={() => navigate('/pagar-pix-nfe')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                  >
                    Pagar com PIX
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* Modal da Receita Federal */}
              {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-300">
                      <div className="bg-white bg-opacity-90 rounded-lg shadow-xl p-8 max-w-md w-full mx-4 backdrop-blur-sm animate-in fade-in-0 zoom-in-95 duration-300">
            {/* Ícone da Receita Federal */}
            <div className="flex justify-center mb-6">
              <img
                src="https://i0.wp.com/www.clickguarulhos.com.br/wp-content/uploads/2017/05/receita-federal-imposto-de-renda-e1554565759223.png?fit=895%2C593&ssl=1"
                alt="Receita Federal"
                className="w-16 h-16 object-contain"
              />
            </div>

            {/* Título */}
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-4">
              Aviso da Receita Federal
            </h3>

            {/* Mensagem */}
            <div className="text-gray-600 text-center leading-relaxed mb-6">
              <p className="mb-3">
                A Receita Federal não autorizou a emissão da Nota Fiscal Eletrônica referente ao seu pedido devido a pendência de regularização fiscal.
              </p>
              
              <div className="w-full h-px bg-gray-300 my-3"></div>
              
              <p>
                De acordo com o Ajuste SINIEF 07/2005, nenhum produto pode ser enviado sem a Nota Fiscal autorizada. Caso o pagamento não seja realizado, a NF-e ficará não autorizada e o produto não será enviado.
              </p>
            </div>

            {/* Botão */}
            <div className="flex justify-center">
              <Button
                onClick={() => setShowModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              >
                Entendi
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PagamentoConfirmado;
