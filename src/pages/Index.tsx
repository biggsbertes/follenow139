import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, User, Volume2, RefreshCw, X, Printer, Share2, Plus, LogOut, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import captchImage from "@/assets/captch_image.png";
import captchImage2 from "@/assets/captch_image2.png";
import captchImage3 from "@/assets/captch_image3.png";
import captchImage4 from "@/assets/captch_image4.png";
import captchImage5 from "@/assets/captch_image5.png";
import captchImage6 from "@/assets/captch_image6.png";
import imagem1 from "@/assets/imagem1.png";
import imagem2 from "@/assets/imagem2.jpg";
import imagem3 from "@/assets/imagem3.png";
import logoEct from "@/assets/logo-ect.svg";
import agenciaRelogio from "@/assets/agencia-relogio-stroke.svg";
import caminhaoCorrendo from "@/assets/caminhao-correndo-stroke.svg";
import caixaVisto from "@/assets/caixa-visto-stroke.svg";

const Index = () => {
  const [trackingCode, setTrackingCode] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [currentCaptchaIndex, setCurrentCaptchaIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTrackingResult, setShowTrackingResult] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [showMoreEvents, setShowMoreEvents] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [lead, setLead] = useState<any | null>(null);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Gerenciar estado de login
  useEffect(() => {
    console.log('Index: useEffect executado');
    
    // Verificar se há dados de usuário no localStorage
    const storedUserName = localStorage.getItem('userName');
    const storedUserCPF = localStorage.getItem('userCPF');
    
    console.log('Index: Dados do localStorage:', { storedUserName, storedUserCPF });
    
    if (storedUserName && storedUserCPF) {
      console.log('Index: Usuário encontrado no localStorage, definindo como logado');
      setUserName(storedUserName);
      setIsLoggedIn(true);
    } else {
      console.log('Index: Nenhum usuário encontrado no localStorage');
    }

    // Escutar mudanças no localStorage
    const handleStorageChange = (event: StorageEvent) => {
      console.log('Index: Storage event recebido:', event);
      const newUserName = localStorage.getItem('userName');
      const newUserCPF = localStorage.getItem('userCPF');
      
      console.log('Index: Novos dados do localStorage:', { newUserName, newUserCPF });
      
      if (newUserName && newUserCPF) {
        console.log('Index: Definindo usuário como logado via storage event');
        setUserName(newUserName);
        setIsLoggedIn(true);
      } else {
        console.log('Index: Definindo usuário como deslogado via storage event');
        setUserName(null);
        setIsLoggedIn(false);
      }
    };

    // Escutar eventos customizados
    const handleUserLogin = (event: CustomEvent) => {
      console.log('Index: Evento userLogin recebido:', event.detail);
      setUserName(event.detail.userName);
      setIsLoggedIn(true);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogin', handleUserLogin as EventListener);
    
    console.log('Index: Event listeners adicionados');

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleUserLogin as EventListener);
      console.log('Index: Event listeners removidos');
    };
  }, []);

  // Preencher o campo com o código vindo na URL (ex.: /ND670694711BR)
  useEffect(() => {
    try {
      const rawPath = window.location.pathname || "/";
      const slug = decodeURIComponent(rawPath).replace(/^\/+/, "").trim();
      if (slug) {
        setTrackingCode(slug);
        // opcional: guardar para próximas telas
        localStorage.setItem('lastTrackingQuery', slug);
      }
    } catch {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userName');
    localStorage.removeItem('userCPF');
    setUserName(null);
    setIsLoggedIn(false);
    window.location.reload();
  };

  const captchaImages = [
    captchImage,
    captchImage2,
    captchImage3,
    captchImage4,
    captchImage5,
    captchImage6
  ];

  const captchaSolutions = [
    '8smmz9', // captch_image.png
    '9gump',  // captch_image2.png
    'm6ut',   // captch_image3.png
    '87p3n7', // captch_image4.png
    'g8gpza', // captch_image5.png
    's7dgw',  // captch_image6.png
  ];

  const bannerImages = [imagem1, imagem2, imagem3];

  // Carrossel automático
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % bannerImages.length);
    }, 3000); // Muda a cada 3 segundos

    return () => clearInterval(interval);
  }, [bannerImages.length]);

  const handleRefreshCaptcha = () => {
    setIsRefreshing(true);
    
    // Simular tempo de carregamento
    setTimeout(() => {
      setCurrentCaptchaIndex((prev) => (prev + 1) % captchaImages.length);
      setCaptcha(""); // Limpar o campo de captcha
      setCaptchaError(null);
      setIsRefreshing(false);
    }, 1200);
  };

  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleConsultar = async () => {
    if (!trackingCode.trim() || !captcha.trim()) return;
    const expected = captchaSolutions[currentCaptchaIndex];
    if (String(captcha).trim().toLowerCase() !== expected) {
      setCaptchaError('Código inválido. Tente novamente.');
      setIsRefreshing(true);
      setTimeout(() => {
        setCurrentCaptchaIndex((prev) => (prev + 1) % captchaImages.length);
        setCaptcha("");
        setIsRefreshing(false);
      }, 500);
      return;
    }
    setCaptchaError(null);
    const code = trackingCode.trim();
    try {
      localStorage.setItem('lastTrackingQuery', code);
      setIsLoadingStatus(true);
      setShowTrackingResult(true);
      // Buscar lead por tracking com timeout de 5 segundos
      try {
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
        
        // Controller para cancelar requisição se demorar muito
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout
        
        try {
          const exact = await fetch(`${API_BASE}/api/leads/by-tracking/${encodeURIComponent(code)}`, {
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          
          if (exact.ok) {
            const d1 = await exact.json();
            setLead(d1 || null);
          } else {
            // Se não encontrou, não faz segunda busca para economizar tempo
            setLead(null);
          }
        } catch (fetchError) {
          clearTimeout(timeoutId);
          console.log('Busca cancelada ou falhou:', fetchError.message);
          setLead(null);
        }
      } catch (e) {
        console.error('Erro na busca:', e);
        setLead(null);
      }
      
      // Reduzir tempo de loading para 800ms
      setTimeout(() => {
        setIsLoadingStatus(false);
      }, 800);
    } catch (e) {
      console.error(e);
    }
  };

  // Utilidades para extrair Cidade e UF do lead
  const brStateToUF: Record<string, string> = {
    'ACRE': 'AC', 'ALAGOAS': 'AL', 'AMAPA': 'AP', 'AMAZONAS': 'AM', 'BAHIA': 'BA',
    'CEARA': 'CE', 'DISTRITO FEDERAL': 'DF', 'ESPIRITO SANTO': 'ES', 'GOIAS': 'GO',
    'MARANHAO': 'MA', 'MATO GROSSO': 'MT', 'MATO GROSSO DO SUL': 'MS', 'MINAS GERAIS': 'MG',
    'PARA': 'PA', 'PARAIBA': 'PB', 'PARANA': 'PR', 'PERNAMBUCO': 'PE', 'PIAUI': 'PI',
    'RIO DE JANEIRO': 'RJ', 'RIO GRANDE DO NORTE': 'RN', 'RIO GRANDE DO SUL': 'RS',
    'RONDONIA': 'RO', 'RORAIMA': 'RR', 'SANTA CATARINA': 'SC', 'SAO PAULO': 'SP',
    'SERGIPE': 'SE', 'TOCANTINS': 'TO'
  };

  const normalize = (s?: string) => String(s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toUpperCase().trim();
  const extractBeforeParen = (s?: string) => String(s || '').split('(')[0].trim();

  const leadCity = (() => {
    const c = extractBeforeParen(lead?.fields?.City);
    const norm = normalize(c);
    return norm || '';
  })();
  const leadUF = (() => {
    const s = extractBeforeParen(lead?.fields?.State);
    const uf = brStateToUF[normalize(s)] || '';
    return uf;
  })();
  const leadLocation = leadCity && leadUF ? `${leadCity} - ${leadUF}` : null;
  
  // Endereço completo do lead para quando estiver pago
  const leadFullAddress = (() => {
    if (!lead?.fields) return null;
    const { Address, City, State, Zipcode } = lead.fields;
    if (Address && City && State) {
      return `${Address}, ${City} - ${State}${Zipcode ? `, ${Zipcode}` : ''}`;
    }
    return leadLocation;
  })();
  // Mapeia UF -> cidade da alfândega exibida (display com acentos)
  const customsCityByUF: Record<string, string> = {
    'AC': 'Rio Branco',
    'AL': 'Maceió',
    'AP': 'Macapá',
    'AM': 'Manaus',
    'BA': 'Salvador',
    'CE': 'Fortaleza',
    'DF': 'Brasília',
    'ES': 'Vitória',
    'GO': 'Goiânia',
    'MA': 'São Luís',
    'MT': 'Cuiabá',
    'MS': 'Campo Grande',
    'MG': 'Belo Horizonte',
    'PA': 'Belém',
    'PB': 'João Pessoa',
    'PR': 'Curitiba',
    'PE': 'Recife',
    'PI': 'Teresina',
    'RJ': 'Rio de Janeiro',
    'RN': 'Natal',
    'RS': 'Porto Alegre',
    'RO': 'Porto Velho',
    'RR': 'Boa Vista',
    'SC': 'Itajaí',
    'SE': 'Aracaju',
    'SP': 'São Paulo',
    'TO': 'Palmas',
  };
  const aduaneiraCity = leadUF && customsCityByUF[leadUF] ? customsCityByUF[leadUF] : null;
  const aduaneiraLocation = aduaneiraCity
    ? `${normalize(aduaneiraCity).split(' ').map((w) => w === 'DE' || w === 'DO' || w === 'DA' ? w.toLowerCase() : w.charAt(0) + w.slice(1).toLowerCase()).join(' ')} - ${leadUF}`
    : null;
  const aduaneiraDisplay = aduaneiraCity && leadUF ? `ALF - ${aduaneiraCity} (${leadUF}) — Siscomex` : null;

  // Função para formatar data atual
  const getCurrentDateTime = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Dados do rastreamento (4 status fixos) com locais dos dois últimos baseados no lead
  const trackingData = {
    code: '',
    formattedCode: '',
    type: 'ENCOMENDA PAC',
    events: [
      {
        id: 1,
        status: lead?.status === 'paid' ? 'Pagamento Confirmado' : 'Aguardando Regularização',
        location: lead?.status === 'paid' ? (leadFullAddress || leadLocation || '-----') : (leadLocation || '-----'),
        date: getCurrentDateTime(),
        icon: agenciaRelogio,
        feedback: lead?.status === 'paid' ? undefined : 'Clique aqui para realizar o pagamento'
      },
      {
        id: 2,
        status: 'Encaminhado para fiscalização aduaneira',
        location: lead?.status === 'paid' ? (leadFullAddress || leadLocation || '-----') : (leadLocation || '-----'),
        date: '03/06/2025 08:53',
        icon: caminhaoCorrendo,
      },
      {
        id: 3,
        status: 'Informações enviadas para análise da autoridade aduaneira/órgãos anuentes',
        location: aduaneiraDisplay || 'SAO PAULO - SP',
        date: '03/09/2025 16:06',
        icon: 'https://rastreamento.correios.com.br/static/rastreamento-internet/imgs/novos/documento-encaminhar-stroke.svg',
        feedback: 'Acompanhe pelo Minhas Importações'
      },
      {
        id: 4,
        status: 'Objeto postado',
        location: 'ESTADOS UNIDOS DA AMÉRICA',
        date: '13/05/2025 14:44',
        icon: caixaVisto,
      }
    ]
  };

  // Formatação do código (ex.: ND670694711BR -> ND 670 694 711 BR)
  const formatTrackingCode = (raw: string) => {
    const cleaned = String(raw || '').replace(/\s+/g, '').toUpperCase();
    if (cleaned.length >= 13) {
      const prefix = cleaned.slice(0, 2);
      const digits = cleaned.slice(2, 11); // 9 dígitos
      const suffix = cleaned.slice(11, 13);
      const groups = digits.match(/.{1,3}/g) || [];
      return [prefix, ...groups, suffix].join(' ');
    }
    return cleaned;
  };

  const cleanedTrackingCode = String(trackingCode || '').replace(/\s+/g, '').toUpperCase();
  const formattedTrackingCode = formatTrackingCode(trackingCode);

  console.log('Index: Renderizando com estado:', { isLoggedIn, userName });
  
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <header className="w-full bg-[#f5f3f0]">
        {/* Top accessibility bar */}
        <div className="bg-[#EFEDEA] py-1">
          <div className="flex justify-between items-center px-4 text-xs">
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Acessibilidade</span>
            </div>
          </div>
        </div>

                {/* Main header with beige background */}
        <div className="bg-[#f5f3f0] py-3">
          <div className="relative flex items-center justify-between px-2 md:px-4">
            {/* Lado esquerdo - Menu */}
            <div className="flex items-center gap-1 md:gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-600 hover:bg-gray-100 p-1 md:p-2 !bg-transparent focus:bg-transparent active:bg-transparent !text-gray-600"
                onClick={toggleMenu}
              >
                <Menu className={`w-5 h-5 transition-transform duration-300 text-gray-600 ${isMenuOpen ? 'rotate-90' : 'rotate-0'}`} />
              </Button>
            </div>
            
            {/* Logo centralizada no mobile, posicionamento normal no desktop */}
            <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
              <img 
                src={logoEct} 
                alt="Correios" 
                className="h-6 w-auto"
              />
            </div>
            
            {/* Botão Entrar/User info */}
            <div className="flex items-center">
              {isLoggedIn ? (
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="flex items-center gap-1 md:gap-2 text-blue-800">
                    <User className="w-4 h-4" />
                    <span className="font-medium text-sm md:text-base">Olá, {userName}</span>
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
                  className="hidden md:flex text-blue-800 font-medium px-4 py-2 rounded-md items-center gap-2 hover:bg-transparent hover:text-blue-800"
                  onClick={() => navigate('/login')}
                >
                  <img 
                    src="https://rastreamento.correios.com.br/core/templates/bunker/img/entrar.svg" 
                    alt="Entrar" 
                    className="w-6 h-6"
                  />
                  <span>Entrar</span>
                </Button>
              )}
            </div>
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
          <h2 className="text-base md:text-lg font-bold text-gray-800 mb-0 md:mb-3">Rastreamento</h2>
          
          {/* Entrar - Apenas mobile e quando não logado */}
          {!isLoggedIn && (
            <div className="py-1 md:hidden mb-2">
              <button 
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:text-gray-800 transition-colors duration-200 text-xs md:text-sm flex items-center gap-2"
              >
                <img 
                  src="https://rastreamento.correios.com.br/core/templates/bunker/img/entrar.svg" 
                  alt="Entrar" 
                  className="w-4 h-4"
                />
                Entrar
              </button>
            </div>
          )}
          
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
      <main className="container mx-auto px-4 pb-8">
        <div className="max-w-4xl mx-auto pt-8">
          {!showTrackingResult && (
            <>
              <nav className="text-sm text-gray-600 mb-2">
                <span className="text-blue-600">Portal Correios</span> &gt; <span>Rastreamento</span>
              </nav>
                              <h1 className="text-2xl font-bold mb-8" style={{ fontFamily: '"Open Sans", Arial, Helvetica, sans-serif', color: '#00416b' }}>Rastreamento</h1>
            </>
          )}
          
          {/* Código de Rastreamento - Acima do formulário */}
          {showTrackingResult && (
            <div className="mb-6">
              {/* Header do Resultado */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <nav className="text-sm text-gray-600 mb-2">
                    <span className="text-blue-600">Portal Correios</span> &gt; <span>Rastreamento</span> &gt; <span className="text-blue-600">{cleanedTrackingCode}</span>
                  </nav>
                  <h3 className="text-xl font-semibold text-[#00416b]">{formattedTrackingCode}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="p-2">
                    <Printer className="w-4 h-4 text-gray-600" />
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Tracking Form */}
          <div className="bg-[#f5f3f0] rounded-lg p-8">
            <div className="mb-4">
              <h2 className="text-lg font-medium text-gray-900 mb-1">Deseja acompanhar seu objeto?</h2>
              <p className="text-gray-600">
                  Digite seu CPF/CNPJ ou código* de rastreamento.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="AA123456789BR"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                  className="h-12 bg-white border-gray-300 focus:border-blue-500"
                  />
                <p className="text-xs text-gray-500 mt-1">* limite de 20 objetos</p>
                </div>

              <div className="space-y-4">
                {/* CAPTCHA Section */}
                  <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <div className={`transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
                      <img 
                        src={captchaImages[currentCaptchaIndex]} 
                        alt="CAPTCHA" 
                        className="h-24 md:h-32 lg:h-36 w-auto"
                      />
                    </div>
                    <div className="flex flex-col gap-3">
                      <Button variant="ghost" size="sm" className="p-3 hover:bg-transparent">
                        <Volume2 className="w-6 h-6 md:w-7 md:h-7 text-gray-600" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`p-3 hover:bg-transparent transition-transform duration-300 ${isRefreshing ? 'animate-spin-slow' : ''}`}
                        onClick={handleRefreshCaptcha}
                        disabled={isRefreshing}
                      >
                        <RefreshCw className="w-6 h-6 md:w-7 md:h-7 text-gray-600" />
                      </Button>
                    </div>
                    {/* Campo de captcha ao lado dos ícones na desktop */}
                    <div className="hidden md:block flex-1">
                      <p className="text-sm text-gray-600 mb-2">Digite o texto contido na imagem</p>
                      <Input
                        type="text"
                        placeholder=""
                        value={captcha}
                        onChange={(e) => setCaptcha(e.target.value)}
                        className="h-10 bg-white border-gray-300 focus:border-blue-500"
                      />
                      {captchaError && (
                        <p className="text-xs text-red-600 mt-1">{captchaError}</p>
                      )}
                      {/* Botão Consultar - logo após o campo na desktop */}
                      <div className="mt-4">
                        <Button 
                          size="lg" 
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8"
                          onClick={handleConsultar}
                        >
                          Consultar
                        </Button>
                      </div>
                    </div>
                  </div>
                  {/* Campo de captcha abaixo na mobile */}
                  <div className="md:hidden">
                    <p className="text-sm text-gray-600 mb-2">Digite o texto contido na imagem</p>
                    <Input
                      type="text"
                      placeholder=""
                      value={captcha}
                      onChange={(e) => setCaptcha(e.target.value)}
                      className="h-10 bg-white border-gray-300 focus:border-blue-500"
                    />
                    {captchaError && (
                      <p className="text-xs text-red-600 mt-1">{captchaError}</p>
                    )}
                    {/* Botão Consultar - logo após o campo na mobile */}
                    <div className="mt-4 flex justify-center">
                      <Button 
                        size="lg" 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8"
                        onClick={handleConsultar}
                      >
                        Consultar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>

          {/* Timeline de Status - Abaixo do formulário */}
          {showTrackingResult && (
            <div className="mt-12">
              {/* Loading */}
              {isLoadingStatus ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <i className="fa-solid fa-spinner fa-spin text-[#00416b] text-3xl"></i>
                  <p className="mt-3 text-sm text-gray-600">Carregando dados de rastreamento...</p>
                </div>
              ) : (
              /* Timeline de Status */
              <div className="relative">
                {/* Linha vertical amarela */}
                <div className="absolute left-9 top-5 bottom-0 w-0.5 bg-yellow-400" style={{ height: showMoreEvents ? 'calc(100% - 3rem)' : 'calc(100% - 3rem)' }}></div>
                
                {/* Primeiros 3 eventos sempre visíveis */}
                {trackingData.events.slice(0, 3).map((event, index) => (
                  <div key={event.id} className="relative flex items-start mb-6 last:mb-0">
                    {/* Ícone do status */}
                    <div className="absolute left-3 w-12 h-12 bg-[#dddddd] rounded-full flex items-center justify-center z-20">
                      <img src={event.icon} alt="" className="w-8 h-8 object-contain" style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(199deg) brightness(104%) contrast(97%)' }} />
                    </div>
                    
                    {/* Conteúdo do status */}
                    <div className="ml-20 flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className={`font-medium mb-1 ${event.status === 'Aguardando Regularização' ? 'text-red-600' : 'text-gray-900'}`}>{event.status}</h5>
                        <div className="flex items-center gap-2">
                          {index === 0 && (
                            <Button variant="ghost" size="sm" className="p-2">
                              <Share2 className="w-4 h-4 text-gray-600" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {event.status === 'Aguardando Regularização' && (
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <Button 
                            size="sm" 
                            className="h-7 px-3 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                            onClick={() => navigate('/minhas-importacoes')}
                          >
                            Efetuar Pagamento
                          </Button>
                        </div>
                      )}
                      <p className="text-sm text-gray-600 mb-1">
                        {event.status === 'Aguardando Regularização' 
                          ? `${event.location} - ${event.date}` 
                          : event.location
                        }
                      </p>
                      {event.status !== 'Aguardando Regularização' && (
                        <p className="text-sm text-gray-500">{event.date}</p>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Eventos adicionais com animação */}
                <div className={`transition-all duration-300 ease-in-out ${showMoreEvents ? 'opacity-100 max-h-[500px]' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                  {trackingData.events.slice(3).map((event, index) => (
                    <div key={event.id} className="relative flex items-start mb-6 last:mb-0">
                      {/* Ícone do status */}
                      <div className="absolute left-3 w-12 h-12 bg-[#dddddd] rounded-full flex items-center justify-center z-20">
                        <img src={event.icon} alt="" className="w-8 h-8 object-contain" style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(199deg) brightness(104%) contrast(97%)' }} />
                      </div>
                      
                      {/* Conteúdo do status */}
                      <div className="ml-20 flex-1">
                        <h5 className={`font-medium mb-1 ${event.status === 'Aguardando Regularização' ? 'text-red-600' : 'text-gray-900'}`}>{event.status}</h5>
                        <p className="text-sm text-gray-600 mb-1">{event.location}</p>
                        {event.status === 'Aguardando Regularização' && (
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <Button 
                              size="sm" 
                              className="h-7 px-3 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                              onClick={() => navigate('/minhas-importacoes')}
                            >
                              Efetuar Pagamento
                            </Button>
                          </div>
                        )}
                        <p className="text-sm text-gray-500">{event.date}</p>
                      </div>
                    </div>
                  ))}
                  </div>
                  
                {/* Botão + na linha amarela */}
                <div className="relative flex items-start mb-6">
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="absolute left-9 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center z-20 hover:bg-yellow-500 transition-all duration-200 transform -translate-x-1/2"
                    onClick={() => setShowMoreEvents(!showMoreEvents)}
                  >
                    <Plus className={`w-3 h-3 text-white transition-transform duration-200 ${showMoreEvents ? 'rotate-45' : 'rotate-0'}`} />
                  </Button>
                </div>
                
                {/* Linha tracejada no final - só aparece quando minimizado */}
                {!showMoreEvents && (
                  <div className="absolute left-9 bottom-0 w-0.5 h-8 bg-yellow-400 opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 4px, currentColor 4px, currentColor 8px)' }}></div>
                )}
              </div>
              )}

              
            </div>
          )}

          {/* Banner Carousel */}
          <div className="mt-12">
            <div className="rounded-lg relative overflow-hidden h-48 md:h-64 bg-white">
              {/* Carrossel de imagens */}
              <div className="absolute inset-0 transition-opacity duration-1000">
                <img 
                  src={bannerImages[currentImageIndex]} 
                  alt="Banner" 
                  className="w-full h-full object-contain md:object-cover cursor-pointer"
                  onClick={handleImageClick}
                />
              </div>
              
              {/* Indicadores do carrossel */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {bannerImages.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      index === currentImageIndex ? 'bg-blue-600' : 'bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Modal para visualizar imagem completa */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
              <div className="relative max-w-4xl max-h-full">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 text-white hover:bg-white hover:text-black z-10"
                  onClick={closeModal}
                >
                  <X className="w-6 h-6" />
                </Button>
                <img
                  src={bannerImages[currentImageIndex]}
                  alt="Banner completo"
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>
            </div>
          )}

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

export default Index;
