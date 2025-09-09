import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, User, Calendar, Clock, MapPin } from "lucide-react";
import logoEct from "@/assets/logo-ect.svg";
import { useNavigate } from "react-router-dom";

const ReagendamentoEntrega = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 horas em segundos
  const [copied, setCopied] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [pixCode, setPixCode] = useState("");
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
  const [trackingCode, setTrackingCode] = useState("");

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    console.log('ReagendamentoEntrega: useEffect executado');
    const storedUserName = localStorage.getItem('userName');
    const storedUserCPF = localStorage.getItem('userCPF');
    console.log('ReagendamentoEntrega: Dados do localStorage:', { storedUserName, storedUserCPF });
    if (storedUserName && storedUserCPF) {
      console.log('ReagendamentoEntrega: Usuário encontrado no localStorage, definindo como logado');
      setUserName(storedUserName);
      setIsLoggedIn(true);
    } else {
      console.log('ReagendamentoEntrega: Nenhum usuário encontrado no localStorage');
    }

    const handleStorageChange = (event: StorageEvent) => {
      console.log('ReagendamentoEntrega: Storage event recebido:', event);
      const newUserName = localStorage.getItem('userName');
      const newUserCPF = localStorage.getItem('userCPF');
      console.log('ReagendamentoEntrega: Novos dados do localStorage:', { newUserName, newUserCPF });
      if (newUserName && newUserCPF) {
        console.log('ReagendamentoEntrega: Definindo usuário como logado via storage event');
        setUserName(newUserName);
        setIsLoggedIn(true);
      } else {
        console.log('ReagendamentoEntrega: Definindo usuário como deslogado via storage event');
        setUserName(null);
        setIsLoggedIn(false);
      }
    };

    const handleUserLogin = (event: CustomEvent) => {
      console.log('ReagendamentoEntrega: Evento userLogin recebido:', event.detail);
      setUserName(event.detail.userName);
      setIsLoggedIn(true);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogin', handleUserLogin as EventListener);
    console.log('ReagendamentoEntrega: Event listeners adicionados');

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleUserLogin as EventListener);
      console.log('ReagendamentoEntrega: Event listeners removidos');
    };
  }, []);

  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      setShowContent(true);
    }, 2000);
    return () => clearTimeout(loadingTimer);
  }, []);

  useEffect(() => {
    if (showPixModal && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setShowPixModal(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showPixModal, timeLeft]);

  useEffect(() => {
    if (showPixModal) setTimeLeft(24 * 60 * 60);
  }, [showPixModal]);

  // Polling para redirecionar após pagar o reagendamento
  useEffect(() => {
    if (!showPixModal) return;
    const code = (localStorage.getItem('lastTrackingQuery') || trackingCode || '').trim();
    if (!code) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/payments/by-tracking/${encodeURIComponent(code)}`);
        if (!res.ok) return;
        const data = await res.json();
        const payments = Array.isArray(data?.payments) ? data.payments : [];
        const paid = payments.some((p: any) => String(p?.status || '').toLowerCase() === 'paid');
        if (paid) {
          setShowPixModal(false);
          navigate('/pagamento-finalizado');
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [showPixModal, trackingCode, API_BASE, navigate]);

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const getPreviousMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const getNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const formatMonthYear = (date: Date) => date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const handleDateClick = (day: number) => {
    const selectedDateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDateObj > today) {
      const year = currentMonth.getFullYear();
      const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const formattedDate = `${year}-${month}-${dayStr}`;
      setSelectedDate(formattedDate);
      console.log('Data selecionada:', formattedDate, 'Dia clicado:', day);
    }
  };

  const isDateSelectable = (day: number) => {
    const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dateObj > today;
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const formattedDateObj = `${year}-${month}-${dayStr}`;
    return formattedDateObj === selectedDate;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    const days = [] as any[];

    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const prevMonthDays = getDaysInMonth(prevMonth);
    for (let i = 0; i < firstDayOfMonth; i++) {
      const prevDay = prevMonthDays - firstDayOfMonth + i + 1;
      days.push(
        <div key={`prev-${i}`} className="text-gray-400 text-center py-2">
          {prevDay}
        </div>
      );
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const selectable = isDateSelectable(day);
      const selected = isDateSelected(day);
      days.push(
        <div
          key={`current-${day}`}
          onClick={() => selectable && handleDateClick(day)}
          className={`text-center py-2 cursor-pointer transition-colors ${
            selectable
              ? selected
                ? 'bg-blue-600 text-white rounded-lg font-semibold'
                : 'hover:bg-blue-100 text-gray-900'
              : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          {day}
        </div>
      );
    }

    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push(
        <div key={`next-${day}`} className="text-gray-400 text-center py-2">
          {day}
        </div>
      );
    }
    return days;
  };

  const handleTimeSelection = (time: string) => setSelectedTime(time);

  const handleConfirmarReagendamento = () => {
    if (selectedDate && selectedTime) {
      console.log('Data selecionada:', selectedDate);
      console.log('Horário selecionado:', selectedTime);
      (async () => {
        try {
          const last = (localStorage.getItem('lastTrackingQuery') || '').trim();
          setTrackingCode(last);
          const res = await fetch(`${API_BASE}/api/payments/pix`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tracking: last, amountCents: 2500, title: 'Reagendamento de Entrega', category: 'reagendamento' })
          });
          const data = await res.json();
          if (!res.ok || data?.error) throw new Error('Falha ao gerar PIX Reagendamento');
          setPixCode(data?.payment?.qrcode || '');
          setShowPixModal(true);
        } catch (e) {
          alert('Erro ao gerar PIX');
        }
      })();
    }
  };

  const handleClosePixModal = () => setShowPixModal(false);

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixCode || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  console.log('ReagendamentoEntrega: Renderizando com estado:', { isLoggedIn, userName });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {isLoading && (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-800">Carregando Reagendamento</p>
          </div>
        </div>
      )}

      <div style={{ opacity: showContent ? 1 : 0, transition: 'opacity 0.5s ease-in-out' }}>
        <header className="w-full bg-[#f5f3f0] border-b border-border">
          <div className="bg-[#f5f3f0] py-2 md:py-3">
            <div className="px-3 md:px-4 flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-4">
                <Button 
                 variant="ghost" 
                 size="sm" 
                 className="text-gray-600 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 p-1 md:p-2"
                 onClick={toggleMenu}
               >
                  <Menu className={`w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 ${isMenuOpen ? 'rotate-90' : 'rotate-0'}`} />
                </Button>
                <img src={logoEct} alt="Correios" className="h-6 w-auto md:h-8" />
              </div>

              {isLoggedIn && (
                <div className="flex items-center gap-2 text-blue-800">
                  <User className="w-4 h-4" />
                  <span className="font-medium text-sm md:text-base">{userName}</span>
                </div>
              )}
            </div>
          </div>
          <div className="w-full h-0.5 bg-yellow-400"></div>
        </header>

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
                  <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors duration-200 text-xs md:text-sm">
                    {category}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        <main className="container mx-auto px-4 pt-8 pb-24 md:pb-28">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Calendar className="w-8 h-8 text-blue-600" />
                  <h1 className="text-2xl md:text-3xl font-bold text-[#00416b]">Reagendamento de Entrega</h1>
                </div>
                <p className="text-gray-600 text-lg">Selecione a data desejada para receber sua encomenda</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <button onClick={getPreviousMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <h3 className="text-lg font-semibold text-gray-900 capitalize">{formatMonthYear(currentMonth)}</h3>
                          <button onClick={getNextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'].map((day) => (
                            <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">{day}</div>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
                      </div>
                      {selectedDate && (
                        <div className="bg-white rounded-lg p-4 border border-gray-200 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div className="flex items-center gap-2 text-green-600 mb-2">
                            <i className="fa-solid fa-calendar-check text-green-600"></i>
                            <span className="font-medium">Data Selecionada</span>
                          </div>
                          <p className="text-lg font-semibold text-green-600 mb-4">{formatDate(selectedDate)}</p>
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Escolha o horário de entrega:</h4>
                            <div className="grid grid-cols-1 gap-2">
                              {[
                                { id: 'manha', label: 'Manhã', time: '8h – 12h' },
                                { id: 'tarde', label: 'Tarde', time: '12h – 18h' },
                                { id: 'noite', label: 'Noite', time: '18h – 21h' }
                              ].map((option) => (
                                <button
                                  key={option.id}
                                  onClick={() => handleTimeSelection(option.id)}
                                  className={`p-3 rounded-lg border transition-colors text-left ${
                                    selectedTime === option.id
                                      ? 'border-green-500 bg-green-50 text-green-700'
                                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                  }`}
                                >
                                  <div className="font-medium">{option.label}</div>
                                  <div className="text-sm text-gray-500">{option.time}</div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Resumo do Reagendamento</h3>
                    <div className="space-y-3 md:space-y-4">
                      <div className="flex justify-between items-center py-2 md:py-3 border-b border-gray-100">
                        <span className="text-sm md:text-base text-gray-600 pr-2">Serviço de Reagendamento</span>
                        <span className="font-medium text-sm md:text-base">R$ 14,75</span>
                      </div>
                      <div className="flex justify-between items-center py-2 md:py-3 border-b border-gray-100">
                        <span className="text-sm md:text-base text-gray-600 pr-2">Seguro Correios</span>
                        <span className="font-medium text-sm md:text-base">R$ 10,25</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 md:pt-3">
                        <span className="text-base md:text-lg font-semibold text-gray-900">Total</span>
                        <span className="text-lg md:text-xl font-bold text-blue-600">R$ 25,00</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Button
                      onClick={handleConfirmarReagendamento}
                      disabled={!selectedDate || !selectedTime}
                      className={`w-full py-4 text-lg font-semibold ${
                        selectedDate && selectedTime ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {!selectedDate ? 'Selecione uma data' : !selectedTime ? 'Selecione um horário' : 'Confirmar Reagendamento'}
                    </Button>
                    <p className="text-xs text-gray-500 text-center">Ao confirmar, você será redirecionado para o pagamento da taxa de reagendamento</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showPixModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 md:p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto p-4 md:p-6 animate-in fade-in zoom-in-95 duration-300 relative">
            <button onClick={handleClosePixModal} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors text-xl font-light">×</button>
            <div className="text-center mb-4 md:mb-6"><p className="text-sm md:text-base text-gray-600">Escaneie o QR Code ou copie o código</p></div>
            <div className="text-center mb-4 md:mb-6"><div className="text-2xl md:text-3xl font-bold text-gray-900">R$ 25,00</div><p className="text-xs md:text-sm text-gray-600">Reagendamento de Entrega</p></div>
            <div className="bg-gray-50 rounded-lg p-4 md:p-6 mb-4 flex justify-center">
              <div className="w-40 h-40 md:w-48 md:h-48 bg-white rounded-lg border-2 border-gray-300 flex items-center justify-center overflow-hidden">
                {pixCode ? (
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(pixCode)}`} alt="QR Code PIX Reagendamento" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-gray-400 text-xs md:text-sm">QR Code</span>
                )}
              </div>
            </div>
            <div className="text-center mb-4"><p className="text-xs text-red-600 mb-1">Prazo para pagamento</p><div className="text-lg font-mono font-bold text-red-600">{formatTime(timeLeft)}</div></div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Código PIX</label>
              <div className="flex gap-2">
                <input type="text" value={pixCode || ''} readOnly className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm" />
                <button onClick={handleCopyPix} className={`px-3 py-2 rounded-md transition-all duration-300 flex items-center justify-center ${copied ? 'bg-green-600 text-white scale-105' : 'bg-blue-600 text-white hover:bg-blue-700'}`} title={copied ? "Copiado!" : "Copiar código PIX"}>
                  {copied ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  )}
                </button>
              </div>
            </div>
            <div className="mb-6">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center"><span className="text-sm text-gray-600">ID da Transação:</span><span className="text-sm font-mono text-gray-900">#REA-2024-001</span></div>
                <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Beneficiário:</span><span className="text-sm text-gray-900">Correios LTDA</span></div>
                <div className="flex justify-between items-center"><span className="text-sm text-gray-600">CNPJ:</span><span className="text-sm font-mono text-gray-900">34.028.316/0001-03</span></div>
              </div>
            </div>
            <div className="mb-6"><p className="text-xs text-gray-500 text-center leading-relaxed">Atenção: em conformidade com o Código de Defesa do Consumidor (Lei nº 8.078/90), os Correios se reservam o direito de reter o produto e suspender a entrega caso o pagamento do reagendamento não seja efetuado.</p></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReagendamentoEntrega;
