import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, ChevronDown, Eye, User, LogOut, MapPin, Hash, Package } from "lucide-react";
import logoEct from "@/assets/logo-ect.svg";
import { localImageGenerator } from "@/lib/localImageGenerator";
import productBase from "@/assets/product-base-image.png";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const MinhasImportacoes = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const displayName = userName ? userName.trim().split(/\s+/).slice(0, 2).join(" ") : null;
  const [productImageUrl, setProductImageUrl] = useState<string | null>(null);
  const [lead, setLead] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
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
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();
  const [valorReais, setValorReais] = useState<string>("");
  const [savingValor, setSavingValor] = useState<boolean>(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [introLoading, setIntroLoading] = useState<boolean>(true);

  // Limpa endereço para não exibir vírgulas/ espaços redundantes nem vírgula final
  const cleanAddressText = (address?: string): string => {
    let s = String(address || '').trim();
    if (!s) return '';
    s = s.replace(/\s*,\s*/g, ', ');       // normaliza espaços ao redor das vírgulas
    s = s.replace(/(,\s*)+/g, ', ');        // colapsa vírgulas repetidas
    s = s.replace(/(?:,|\s)+$/g, '');       // remove vírgulas/ espaços finais
    s = s.replace(/\s{2,}/g, ' ');          // colapsa múltiplos espaços
    return s.trim();
  };

  // Gera a imagem do produto com nome e endereço do lead
  const generateWithLead = async (overrideName?: string, overrideAddress?: string) => {
    const fallbackStored = localStorage.getItem('userName') || undefined;
    const leadName = (overrideName ?? userName ?? fallbackStored) || "Cliente";
    setIsGenerating(true);
    try {
      let address: string | undefined = undefined;
      if (overrideAddress !== undefined) {
        address = overrideAddress;
      } else {
        try {
          const res = await fetch(`${API_BASE}/api/leads`);
          if (res.ok) {
            const data = await res.json();
            const leads: any[] = Array.isArray(data.leads) ? data.leads : [];
            const match = leads.find(l => (l.fields?.Name || '').toLowerCase() === leadName.toLowerCase());
            address = match?.fields?.Address ?? undefined;
          }
        } catch {}
      }

      const dataUrl = await localImageGenerator.generateProductImage({ name: leadName, address });
      if (dataUrl && dataUrl.startsWith('data:image')) {
        setProductImageUrl(dataUrl);
        localStorage.setItem('productImageUrl', dataUrl);
      } else {
        throw new Error('URL inválida gerada');
      }
    } catch {
      setProductImageUrl(productBase);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Gerenciar estado de login e buscar dados por tracking/CPF
  useEffect(() => {
    console.log('MinhasImportacoes: useEffect executado');
    
    // Verificar se há dados de usuário no localStorage
    const storedUserName = localStorage.getItem('userName');
    const storedUserCPF = localStorage.getItem('userCPF');
    const storedProductImageUrl = localStorage.getItem('productImageUrl');
    
    console.log('MinhasImportacoes: Dados do localStorage:', { storedUserName, storedUserCPF });
    
    if (storedUserName && storedUserCPF) {
      console.log('MinhasImportacoes: Usuário encontrado no localStorage, definindo como logado');
      setUserName(storedUserName);
      setIsLoggedIn(true);
    } else {
      console.log('MinhasImportacoes: Nenhum usuário encontrado no localStorage');
    }

    // Buscar lead por tracking ou cpf salvo da tela anterior
    const last = (localStorage.getItem('lastTrackingQuery') || '').trim();
    if (last) {
      const q = last.replace(/\D/g, '');
      setLoading(true);
      const tryFetch = async () => {
        // 1) Tentar match exato por tracking
        try {
          const r1 = await fetch(`${API_BASE}/api/leads/by-tracking/${encodeURIComponent(last)}`);
          if (r1.ok) {
            const d1 = await r1.json();
            return { lead: d1 };
          }
        } catch {}
        // 2) Fallback para search (cpf/tracking)
        try {
          const url = q.length >= 11
            ? `${API_BASE}/api/leads/search?cpf=${encodeURIComponent(q)}`
            : `${API_BASE}/api/leads/search?tracking=${encodeURIComponent(last)}`;
          const r2 = await fetch(url);
          if (r2.ok) {
            const d2 = await r2.json();
            const found2 = (d2.leads || [])[0] || null;
            return { lead: found2 };
          }
        } catch {}
        return { lead: null };
      };
      tryFetch()
        .then(async (res) => {
          const found = res.lead || null;
          setLead(found);
          if (found?.fields?.Name) {
            setUserName(found.fields.Name);
            setIsLoggedIn(true);
            try {
              localStorage.removeItem('productImageUrl');
            } catch {}
            const onlyAddress = String(found.fields.Address || '').trim();
            await generateWithLead(found.fields.Name, onlyAddress);
          }
          try {
            // Definir valor a pagar somente a partir do lead (não consultar /api/config aqui)
            const valorCents = typeof found?.tarifaBrl === 'number' ? found.tarifaBrl : 0;
            if (valorCents > 0) setValorReais((valorCents / 100).toFixed(2).replace('.', ','));
          } catch {}
        })
        .catch((e) => console.error(e))
        .finally(() => setLoading(false));
    }

    // Definir imagem do produto (campo produto)
    const generateWithLead = async (overrideName?: string, overrideAddress?: string) => {
      // Gerar imagem localmente com nome e endereço do lead (se disponível)
      const leadName = (overrideName ?? storedUserName) || "Cliente";
      setIsGenerating(true);
      try {
        // Tenta buscar endereço do backend (mais recente com mesmo nome)
        let address: string | undefined = undefined;
        if (overrideAddress !== undefined) {
          address = overrideAddress;
        } else {
          try {
            const res = await fetch('http://localhost:3001/api/leads');
            if (res.ok) {
              const data = await res.json();
              const leads: any[] = Array.isArray(data.leads) ? data.leads : [];
              const match = leads.find(l => (l.fields?.Name || '').toLowerCase() === leadName.toLowerCase());
              address = match?.fields?.Address ?? undefined;
            }
          } catch {}
        }

        const dataUrl = await localImageGenerator.generateProductImage({ name: leadName, address });
        if (dataUrl && dataUrl.startsWith('data:image')) {
          setProductImageUrl(dataUrl);
          localStorage.setItem('productImageUrl', dataUrl);
        } else {
          throw new Error('URL inválida gerada');
        }
      } catch {
        setProductImageUrl(productBase);
      } finally {
        setIsGenerating(false);
      }
    };

    if (storedProductImageUrl && storedProductImageUrl.trim().length > 0) {
      setProductImageUrl(storedProductImageUrl);
    }

    // Escutar mudanças no localStorage
    const handleStorageChange = (event: StorageEvent) => {
      console.log('MinhasImportacoes: Storage event recebido:', event);
      const newUserName = localStorage.getItem('userName');
      const newUserCPF = localStorage.getItem('userCPF');
      const newProductImageUrl = localStorage.getItem('productImageUrl');
      
      console.log('MinhasImportacoes: Novos dados do localStorage:', { newUserName, newUserCPF });
      
      if (newUserName && newUserCPF) {
        console.log('MinhasImportacoes: Definindo usuário como logado via storage event');
        setUserName(newUserName);
        setIsLoggedIn(true);
      } else {
        console.log('MinhasImportacoes: Definindo usuário como deslogado via storage event');
        setUserName(null);
        setIsLoggedIn(false);
      }

      // Atualizar imagem do produto quando mudar no localStorage
      if (newProductImageUrl) {
        setProductImageUrl(newProductImageUrl);
      }
    };

    // Escutar eventos customizados
    const handleUserLogin = (event: CustomEvent) => {
      console.log('MinhasImportacoes: Evento userLogin recebido:', event.detail);
      setUserName(event.detail.userName);
      setIsLoggedIn(true);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userLogin', handleUserLogin as EventListener);
    
    console.log('MinhasImportacoes: Event listeners adicionados');

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', handleUserLogin as EventListener);
      console.log('MinhasImportacoes: Event listeners removidos');
    };
  }, []);

  // Sempre que o lead chegar/atualizar, regerar a imagem com o nome/endereço do lead
  useEffect(() => {
    if (lead?.fields?.Name) {
      void (async () => {
        await generateWithLead(lead.fields.Name, lead.fields.Address);
      })();
    }
  }, [lead?.fields?.Name, lead?.fields?.Address]);

  // Overlay inicial: mostrar por ~4s antes de exibir a página
  useEffect(() => {
    const timer = setTimeout(() => setIntroLoading(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userName');
    localStorage.removeItem('userCPF');
    setUserName(null);
    setIsLoggedIn(false);
    window.location.reload();
  };

  console.log('MinhasImportacoes: Renderizando com estado:', { isLoggedIn, userName });

  const parseReaisToCents = (txt: string) => {
    const normalized = String(txt || '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
    const num = Number(normalized);
    if (Number.isNaN(num) || num <= 0) return 0;
    return Math.round(num * 100);
  };

  const handleSalvarValor = async () => {
    if (!lead?.id) return;
    const cents = parseReaisToCents(valorReais);
    setSavingValor(true);
    try {
      const res = await fetch(`${API_BASE}/api/leads/${encodeURIComponent(lead.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tarifaBrl: cents })
      });
      if (!res.ok) throw new Error('Falha ao salvar');
      const updated = await res.json();
      setLead(updated);
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar valor');
    } finally {
      setSavingValor(false);
    }
  };

  const handleConcluirPagamento = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setTimeout(() => {
      navigate("/pagar-tarifa-pagamento");
    }, 600);
  };
  
  if (introLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-800">Carregando importações</p>
        </div>
      </div>
    );
  }

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
                <span className="font-medium text-sm md:text-base">{displayName}</span>
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
      <main className="max-w-4xl mx-auto px-6 pt-8 pb-28 md:pb-32">
        {loading && (<div className="mb-4 text-sm text-gray-600">Carregando...</div>)}
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-blue-800">Minhas Importações</h1>
        </div>

        {/* Card: Imagem do Produto */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-0">
              <button
                type="button"
                onClick={() => setIsImageModalOpen(true)}
                className="w-full group relative rounded-md overflow-hidden"
                aria-label="Ampliar imagem"
              >
                <span className="pointer-events-none absolute top-2 left-2 text-xs bg-red-600 text-white px-2 py-0.5 rounded shadow">Pacote Retido</span>
                <div className="w-full flex items-center justify-center bg-white p-4">
                  <img
                    src={productImageUrl ?? '/placeholder.svg'}
                    alt="Imagem do produto"
                    className="max-h-64 w-full object-contain"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
                  />
                </div>
                <div className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                <span className="pointer-events-none absolute bottom-2 right-2 text-xs bg-black/60 text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">Clique para ampliar</span>
              </button>
            </CardContent>
          </Card>

          <Dialog open={isImageModalOpen} onOpenChange={(open) => { setIsImageModalOpen(open); if (!open) setIsZoomed(false); }}>
            <DialogContent className="w-[95vw] md:w-auto max-w-[95vw] md:max-w-[80vw] p-2 bg-white">
              <div className="w-full max-h-[80vh] overflow-auto flex items-center justify-center">
                <img
                  src={productImageUrl ?? '/placeholder.svg'}
                  alt="Visualização ampliada"
                  className={`object-contain transition-transform duration-200 max-w-full max-h-[75vh] ${isZoomed ? 'scale-125' : 'scale-100'}`}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
                  onClick={() => setIsZoomed((z) => !z)}
                  title="Clique para aumentar/reduzir"
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
        

        {/* Informações da Remessa (dados da DB) */}
        <div className="bg-white rounded-lg p-6 mb-8">
          <h3 className="text-sm font-semibold text-gray-700 tracking-wide uppercase mb-4">Informações da Remessa</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs uppercase text-gray-500 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-gray-400" /> Remetente</div>
              <div className="text-sm text-gray-900">{lead?.fields?.Name || '-'}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-gray-500 flex items-center gap-1.5"><Hash className="w-3.5 h-3.5 text-gray-400" /> Código da Remessa</div>
              <div className="text-sm text-gray-900">{lead?.fields?.Tracking || '-'}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-xs uppercase text-gray-500 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" /> Endereço do Destinatário</div>
              <div className="text-sm text-gray-900">{cleanAddressText(lead?.fields?.Address) || '-'}</div>
            </div>
            <div className="md:col-span-2 border-t border-gray-300 pt-3 mt-1">
              <div className="text-xs uppercase text-gray-500">Valor a Pagar (R$)</div>
              <div className="text-lg font-semibold text-gray-900">{valorReais || '0,00'}</div>
            </div>
          </div>
        </div>

        {/* Itens da Remessa (exibe campos principais) */}
        <div className="bg-white rounded-lg p-6 mb-8">
          <h3 className="text-sm font-semibold text-gray-700 tracking-wide uppercase mb-4">Itens da Remessa</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <div className="text-xs uppercase text-gray-500 flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-gray-400" /> Produto</div>
              <div className="text-sm text-gray-900">{lead?.fields?.Product || '-'}</div>
            </div>
          </div>
        </div>

        {/* Efetuar Pagamento Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-blue-800 mb-4">Efetuar Pagamento</h2>
          
          {/* Message */}
          <div className="mb-6">
            <p className="text-sm text-gray-800">
              O prosseguimento deste pagamento garante apenas a continuidade regular do processo de liberação da sua encomenda
            </p>
          </div>
        </div>

        {/* Payment Button */}
        <div className="flex justify-center">
          <Button 
            className="bg-blue-800 hover:bg-blue-900 text-white px-8 py-3 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
            onClick={handleConcluirPagamento}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <i className="fa-solid fa-spinner fa-spin"></i>
                Processando...
              </span>
            ) : (
              'Concluir pagamento'
            )}
          </Button>
        </div>
      </main>
      {/* Footer (mesmo da página inicial) */}
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

export default MinhasImportacoes;
