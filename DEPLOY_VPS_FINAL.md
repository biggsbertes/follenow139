# 🚀 **DEPLOY FINAL NA VPS - TUDO CONFIGURADO!**

## ✅ **Arquivo .env Criado:**

Criei o arquivo `env-production.txt` com **TODAS** as configurações que você especificou:

- ✅ **Chaves Hydra** (todas as 3 categorias)
- ✅ **Token de importação** seguro
- ✅ **Configurações de tarifa** 
- ✅ **Otimizações para 32GB RAM**
- ✅ **Rate limiting otimizado**
- ✅ **Configurações de banco**
- ✅ **VITE_API_BASE=https://correios-tracking.com**

## 🚀 **Como Fazer o Deploy:**

### **1. Na VPS:**
```bash
# Conectar na VPS
ssh usuario@seu-ip-da-vps

# Ir para o diretório do projeto
cd /var/www/correios

# Parar aplicação atual
pm2 stop correios-api
pm2 delete correios-api
```

### **2. Fazer Upload dos Arquivos:**
```bash
# Copiar todos os arquivos do projeto para a VPS
# (incluindo o arquivo env-production.txt)
```

### **3. Executar Deploy:**
```bash
# Na VPS
cd /var/www/correios

# Executar script de deploy
chmod +x deploy.sh
./deploy.sh
```

### **4. Verificar se Funcionou:**
```bash
# Ver logs
pm2 logs correios-api

# Testar API
curl https://correios-tracking.com/api/health

# Testar importação
# Acessar: https://correios-tracking.com/import-leads
```

## 🎯 **O que o Script de Deploy Faz:**

1. ✅ **Para a aplicação atual**
2. ✅ **Instala dependências**
3. ✅ **Copia `env-production.txt` para `.env`**
4. ✅ **Configura `VITE_API_BASE=https://correios-tracking.com`**
5. ✅ **Faz build do frontend React**
6. ✅ **Inicia aplicação com PM2**
7. ✅ **Salva configuração do PM2**

## 🔧 **Configurações Incluídas:**

### **Chaves Hydra:**
- ✅ Tarifas normais
- ✅ NF-e
- ✅ Reagendamento

### **Performance (32GB RAM):**
- ✅ `UV_THREADPOOL_SIZE=64`
- ✅ `NODE_OPTIONS=--max-old-space-size=16384`
- ✅ `DB_CACHE_SIZE=50000`
- ✅ `DB_MMAP_SIZE=1073741824`

### **Rate Limiting Otimizado:**
- ✅ `RATE_LIMIT_MAX_REQUESTS=500`
- ✅ `TRACKING_RATE_LIMIT_MAX=100`
- ✅ `PAYMENT_RATE_LIMIT_MAX=50`

### **Frontend:**
- ✅ `VITE_API_BASE=https://correios-tracking.com`

## 🎉 **Resultado Final:**

- ✅ **Importação de leads funcionando** em `https://correios-tracking.com/import-leads`
- ✅ **API funcionando** em `https://correios-tracking.com/api/*`
- ✅ **Frontend React** servido pela API
- ✅ **Todas as configurações** aplicadas
- ✅ **Performance otimizada** para 32GB RAM

## 🆘 **Se Houver Problemas:**

### **Verificar .env:**
```bash
cat /var/www/correios/.env
```

### **Verificar Logs:**
```bash
pm2 logs correios-api --lines 50
```

### **Verificar Status:**
```bash
pm2 status
```

**Agora é só fazer o deploy e tudo vai funcionar perfeitamente!** 🚀
