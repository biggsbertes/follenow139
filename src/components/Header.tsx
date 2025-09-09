import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Menu, User, LogOut } from "lucide-react";
import entrarIcon from "@/assets/entrar-cor.svg";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const displayName = userName ? userName.trim().split(/\s+/).slice(0, 2).join(" ") : null;

  useEffect(() => {
    console.log('Header: useEffect executado');
    
    // Verificar se há dados de usuário no localStorage
    const storedUserName = localStorage.getItem('userName');
    const storedUserCPF = localStorage.getItem('userCPF');
    
    console.log('Header: Dados do localStorage:', { storedUserName, storedUserCPF });
    
    if (storedUserName && storedUserCPF) {
      console.log('Header: Usuário encontrado no localStorage, definindo como logado');
      setUserName(storedUserName);
      setIsLoggedIn(true);
    } else {
      console.log('Header: Nenhum usuário encontrado no localStorage');
    }

    // Escutar mudanças no localStorage
    const handleStorageChange = (event: StorageEvent) => {
      console.log('Header: Storage event recebido:', event);
      const newUserName = localStorage.getItem('userName');
      const newUserCPF = localStorage.getItem('userCPF');
      
      console.log('Header: Novos dados do localStorage:', { newUserName, newUserCPF });
      
      if (newUserName && newUserCPF) {
        console.log('Header: Definindo usuário como logado via storage event');
        setUserName(newUserName);
        setIsLoggedIn(true);
      } else {
        console.log('Header: Definindo usuário como deslogado via storage event');
        setUserName(null);
        setIsLoggedIn(false);
      }
    };

    // Escutar eventos customizados
    const handleUserLogin = (event: CustomEvent) => {
      console.log('Header: Evento userLogin recebido:', event.detail);
      setUserName(event.detail.userName);
      setIsLoggedIn(true);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogin', handleUserLogin as EventListener);
    
    console.log('Header: Event listeners adicionados');

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleUserLogin as EventListener);
      console.log('Header: Event listeners removidos');
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userName');
    localStorage.removeItem('userCPF');
    setUserName(null);
    setIsLoggedIn(false);
    window.location.reload();
  };

  console.log('Header: Renderizando com estado:', { isLoggedIn, userName });
  
  return (
    <header className="w-full bg-[#f5f3f0]">
      {/* Top bar - Dark gray with Acessibilidade */}
      <div className="bg-gray-800 py-2">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <span className="text-blue-400 cursor-pointer hover:text-blue-300">Acessibilidade</span>
            <ChevronDown className="w-3 h-3 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Main header - Light beige background */}
      <div className="bg-[#F5F3F0] py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Left side - Menu and Logo */}
          <div className="flex items-center gap-4">
            {/* Hamburger menu */}
            <Button
              variant="ghost"
              size="sm"
              className="p-0 text-gray-600 hover:bg-gray-100 flex items-center justify-center !bg-transparent focus:bg-transparent active:bg-transparent !text-gray-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </Button>

            {/* Correios Logo */}
            <div className="flex items-center gap-2">
              {/* Logo icon - two arrows */}
              <div className="flex flex-col gap-1 justify-center">
                <div className="w-6 h-1 bg-blue-600 rounded-sm"></div>
                <div className="w-6 h-1 bg-yellow-500 rounded-sm"></div>
              </div>
              {/* Correios text */}
              <span className="text-blue-800 font-semibold text-xl leading-none">Correios</span>
            </div>
          </div>

          {/* Right side - Login/User info */}
          <div className="flex items-center">
            {isLoggedIn ? (
              <div className="flex items-center gap-2 md:gap-3">
                <div className="flex items-center gap-1 md:gap-2 text-blue-800">
                  <User className="w-4 h-4" />
                  <span className="font-medium text-sm md:text-base">Olá, {displayName}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center justify-center text-red-600 hover:bg-red-50 px-2 py-1"
                  onClick={handleLogout}
                  title="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-blue-800 hover:bg-blue-50 px-4 py-2"
              >
                <img 
                  src={entrarIcon} 
                  alt="Entrar" 
                  className="w-4 h-4"
                />
                <span className="font-medium">Entrar</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Yellow separator line */}
      <div className="w-full h-1 bg-yellow-400"></div>
    </header>
  );
};

export default Header;