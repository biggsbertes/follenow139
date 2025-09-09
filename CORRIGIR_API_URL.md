# 🔧 **CORRIGIR URL DA API - Problema Resolvido!**

## ❌ **O que estava acontecendo:**
Sua aplicação React estava fazendo requisições para `http://localhost:3001` em produção, mas deveria fazer para `https://correios-tracking.com`.

## ✅ **Solução:**

### **1. Criar arquivo .env na VPS:**
```bash
# Na VPS, criar o arquivo .env
cd /var/www/correios
nano .env
```

**Conteúdo do arquivo .env:**
```env
# Configuração da API
VITE_API_BASE=https://correios-tracking.com

# Configurações do servidor
NODE_ENV=production
PORT=3001

# Configurações de pagamento (ajuste conforme necessário)
HYDRA_PK=your_hydra_public_key
HYDRA_SK=your_hydra_secret_key
HYDRA_PK_NFE=your_hydra_nfe_public_key
HYDRA_SK_NFE=your_hydra_nfe_secret_key
HYDRA_PK_REAGENDAMENTO=your_hydra_reagendamento_public_key
HYDRA_SK_REAGENDAMENTO=your_hydra_reagendamento_secret_key

# Configurações de taxa
TAX_PERCENT=50
USD_BRL_RATE_CENTS=520
TARIFA_BRL_DEFAULT=6471

# Token de importação
IMPORT_SECRET=import_secret_2025

# URL de postback (opcional)
POSTBACK_URL=https://correios-tracking.com/api/payments/webhook
```

### **2. Fazer Deploy Completo:**
```bash
# Parar aplicação atual
pm2 stop correios-api
pm2 delete correios-api

# Fazer upload dos arquivos corrigidos
# (copie todos os arquivos do projeto para a VPS)

# Instalar dependências e fazer build
cd /var/www/correios
npm install

# Configurar variável de ambiente
export VITE_API_BASE="https://correios-tracking.com"

# Fazer build do frontend
npm run build

# Iniciar aplicação
pm2 start ecosystem.config.cjs --env production
pm2 save
```

### **3. Verificar se Funcionou:**
```bash
# Ver logs
pm2 logs correios-api

# Testar a página de importação
curl https://correios-tracking.com/import-leads
```

## 🎯 **O que vai acontecer agora:**

### **Antes (❌ Erro):**
- Frontend fazia requisição para: `http://localhost:3001/api/secure/import-leads`
- Erro: "Cannot connect to localhost:3001"

### **Depois (✅ Funcionando):**
- Frontend faz requisição para: `https://correios-tracking.com/api/secure/import-leads`
- Sucesso: Importação funcionando perfeitamente

## 🔍 **Como Verificar:**

### **1. Verificar se a variável está configurada:**
```bash
# Na VPS
echo $VITE_API_BASE
# Deve mostrar: https://correios-tracking.com
```

### **2. Verificar o build:**
```bash
# Verificar se o build foi feito com a URL correta
grep -r "correios-tracking.com" dist/
```

### **3. Testar a importação:**
- Acesse: https://correios-tracking.com/import-leads
- Faça upload de um CSV
- Deve funcionar sem erros

## 🚨 **Se Ainda Houver Problemas:**

### **Verificar Logs:**
```bash
pm2 logs correios-api --lines 50
```

### **Verificar Nginx:**
```bash
sudo nginx -t
sudo systemctl status nginx
```

### **Verificar se o arquivo .env existe:**
```bash
ls -la /var/www/correios/.env
cat /var/www/correios/.env
```

## 📝 **Resumo:**
1. ✅ Criar arquivo `.env` com `VITE_API_BASE=https://correios-tracking.com`
2. ✅ Fazer build do frontend com a variável correta
3. ✅ Reiniciar aplicação
4. ✅ Testar importação de leads

**Agora sua importação de leads vai funcionar perfeitamente!** 🎉
