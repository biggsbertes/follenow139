# 🔧 **Configuração para VPS**

## 📋 **Como Configurar na VPS:**

### **1. Copiar seu arquivo .env para a VPS:**
```bash
# Na VPS, criar o arquivo .env com suas configurações
nano /var/www/correios/.env
```

### **2. Adicionar no final do arquivo .env da VPS:**
```bash
# ===== CONFIGURAÇÕES DO FRONTEND =====
# Em produção, deixar vazio para usar o mesmo domínio
VITE_API_BASE=
```

### **3. Seu arquivo .env na VPS deve ficar assim:**
```bash
# ===== CONFIGURAÇÕES DO SERVIDOR =====
PORT=3001
NODE_ENV=production

# ===== OTIMIZAÇÕES DE PERFORMANCE (32GB RAM) =====
UV_THREADPOOL_SIZE=64
NODE_OPTIONS=--max-old-space-size=16384 --max-semi-space-size=512

# ===== TOKEN DE IMPORTAÇÃO SEGURA =====
IMPORT_SECRET=f96f3f4e-d12c-4a36-84f6-df4f40f928c2

# ===== CONFIGURAÇÕES DE TARIFA =====
TARIFA_BRL_DEFAULT=6471
TAX_PERCENT=50
USD_BRL_RATE_CENTS=520

# ===== CHAVES DO SISTEMA DE PAGAMENTO HYDRA =====
# Chaves principais (para tarifas normais)
HYDRA_PK=pk_PhcLRPDd00n29nRFklZEqj9OIvudnFdIOe2o_pUdWMxzTVtK
HYDRA_SK=sk_ga-eq8-WRv57-nZIbi3UO3DFQlIyyxDefnUMrqwChJrD4x2q

# Chaves para NF-e
HYDRA_PK_NFE=pk_Cf2NslDo-317jRvIT8UxhTt3yrktYteTnumSTeK18Jh19Xk8
HYDRA_SK_NFE=sk_wz-1M_PaXJCFBAfEBtcujbdwIBEDcrXYY0Plqs793T07Jh98

# Chaves para reagendamento
HYDRA_PK_REAGENDAMENTO=pk_Cf2NslDo-317jRvIT8UxhTt3yrktYteTnumSTeK18Jh19Xk8
HYDRA_SK_REAGENDAMENTO=sk_wz-1M_PaXJCFBAfEBtcujbdwIBEDcrXYY0Plqs793T07Jh98

# ===== URL DE POSTBACK =====
POSTBACK_URL=https://seu-dominio.com/webhook

# ===== CONFIGURAÇÕES DE CACHE =====
CACHE_TTL=30000
TRACKING_CACHE_TTL=60000

# ===== CONFIGURAÇÕES DE RATE LIMITING (OTIMIZADO PARA 32GB RAM) =====
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=500
TRACKING_RATE_LIMIT_MAX=100
PAYMENT_RATE_LIMIT_MAX=50

# ===== CONFIGURAÇÕES DE BANCO DE DADOS (32GB RAM) =====
DB_CACHE_SIZE=50000
DB_MMAP_SIZE=1073741824
DB_JOURNAL_MODE=WAL
DB_SYNCHRONOUS=NORMAL

# ===== CONFIGURAÇÕES DE SEGURANÇA =====
CORS_ORIGIN=*
CORS_CREDENTIALS=true
JSON_LIMIT=10mb

# ===== CONFIGURAÇÕES DE LOG =====
LOG_LEVEL=info
LOG_SLOW_REQUESTS=true
SLOW_REQUEST_THRESHOLD=1000

# ===== CONFIGURAÇÕES DE MONITORAMENTO =====
ENABLE_METRICS=true
METRICS_CACHE_TTL=30000

# ===== CONFIGURAÇÕES DO FRONTEND =====
# Em produção, deixar vazio para usar o mesmo domínio
VITE_API_BASE=
```

## 🚀 **Deploy Completo:**

### **1. Fazer Upload dos Arquivos:**
```bash
# Copiar todos os arquivos corrigidos para a VPS
scp -r . usuario@seu-ip-da-vps:/var/www/correios/
```

### **2. Configurar na VPS:**
```bash
# Conectar na VPS
ssh usuario@seu-ip-da-vps

# Ir para o diretório
cd /var/www/correios

# Parar aplicação atual
pm2 stop correios-api
pm2 delete correios-api

# Configurar o .env (copiar suas configurações + adicionar VITE_API_BASE=)
nano .env

# Instalar dependências
npm install

# Fazer build do frontend
npm run build

# Iniciar aplicação
pm2 start ecosystem.config.cjs --env production
pm2 save
```

## ✅ **Resultado:**
- ✅ Desenvolvimento: Usa `http://localhost:3001`
- ✅ Produção: Usa o mesmo domínio da VPS
- ✅ Importação de leads funcionando perfeitamente
- ✅ Todas as configurações preservadas

## 🎯 **Resumo:**
1. Copie seu `.env` atual para a VPS
2. Adicione `VITE_API_BASE=` no final
3. Faça o deploy
4. Pronto! 🚀
