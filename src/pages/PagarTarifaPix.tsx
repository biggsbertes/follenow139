import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, User, ArrowLeft } from "lucide-react";
import logoEct from "@/assets/logo-ect.svg";
import { useNavigate } from "react-router-dom";

const PagarTarifaPix = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Gerenciar estado de login
  useEffect(() => {
    console.log('PagarTarifaPix: useEffect executado');
    
    // Verificar se há dados de usuário no localStorage
    const storedUserName = localStorage.getItem('userName');
    const storedUserCPF = localStorage.getItem('userCPF');
    
    console.log('PagarTarifaPix: Dados do localStorage:', { storedUserName, storedUserCPF });
    
    if (storedUserName && storedUserCPF) {
      console.log('PagarTarifaPix: Usuário encontrado no localStorage, definindo como logado');
      setUserName(storedUserName);
      setIsLoggedIn(true);
    } else {
      console.log('PagarTarifaPix: Nenhum usuário encontrado no localStorage');
    }

    // Escutar mudanças no localStorage
    const handleStorageChange = (event: StorageEvent) => {
      console.log('PagarTarifaPix: Storage event recebido:', event);
      const newUserName = localStorage.getItem('userName');
      const newUserCPF = localStorage.getItem('userCPF');
      
      console.log('PagarTarifaPix: Novos dados do localStorage:', { newUserName, newUserCPF });
      
      if (newUserName && newUserCPF) {
        console.log('PagarTarifaPix: Definindo usuário como logado via storage event');
        setUserName(newUserName);
        setIsLoggedIn(true);
      } else {
        console.log('PagarTarifaPix: Definindo usuário como deslogado via storage event');
        setUserName(null);
        setIsLoggedIn(false);
      }
    };

    // Escutar eventos customizados
    const handleUserLogin = (event: CustomEvent) => {
      console.log('PagarTarifaPix: Evento userLogin recebido:', event.detail);
      setUserName(event.detail.userName);
      setIsLoggedIn(true);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogin', handleUserLogin as EventListener);
    
    console.log('PagarTarifaPix: Event listeners adicionados');

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleUserLogin as EventListener);
      console.log('PagarTarifaPix: Event listeners removidos');
    };
  }, []);

  console.log('PagarTarifaPix: Renderizando com estado:', { isLoggedIn, userName });
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="w-full bg-[#f5f3f0] border-b border-border">
        {/* Main header with beige background */}
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
              "Rastreamento em outros países",
              "Perguntas frequentes",
              "Busca Agências",
              "Central de Atendimento",
              "Prazo de Guarda Objetos Nacionais",
              "Prazo de Guarda Objetos Internacionais",
              "Restrição de Entrega por CEP"
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
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Payment Methods - Left side */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <img 
                    src="https://img.icons8.com/color/48/pix.png" 
                    alt="PIX" 
                    className="w-8 h-8"
                  />
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Pagamento PIX</h1>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-600 text-sm md:text-base">
                    Escaneie o QR Code ou copie o código PIX para realizar o pagamento da tarifa de importação.
                  </p>

                  {/* QR Code */}
                  <div className="bg-gray-50 rounded-lg p-6 flex justify-center">
                    <div className="w-48 h-48 bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">QR Code PIX</span>
                    </div>
                  </div>

                  {/* Código PIX */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código PIX
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value="00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426614174000520400005303986540510.005802BR5913Correios LTDA6008Brasilia62070503***"
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText("00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426614174000520400005303986540510.005802BR5913Correios LTDA6008Brasilia62070503***")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>

                  {/* Botão Voltar */}
                  <div className="mt-6 md:mt-8">
                    <Button 
                      variant="outline" 
                      className="w-full md:w-auto px-6 py-3 text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900"
                      onClick={() => navigate("/pagar-tarifa")}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar
                    </Button>
                  </div>
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
                   <span className="font-semibold text-sm md:text-base">R$ 32,64</span>
                 </div>
                 
                 <div className="border-t pt-2 md:pt-3">
                   <div className="flex justify-between items-center">
                     <span className="text-base md:text-lg font-semibold text-gray-900">Total</span>
                     <span className="text-lg md:text-xl font-bold text-blue-600">R$ 32,64</span>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </div>
     </main>
    </div>
  );
};

export default PagarTarifaPix;
