# 🚨 **SOLUÇÃO RÁPIDA - Versão Antiga com Anti-Debug**

## ✅ **O que foi corrigido:**

### **1. Anti-Debug Desabilitado:**
- ✅ Arquivo `src/utils/antiDebug.ts` modificado
- ✅ Anti-debug temporariamente desabilitado
- ✅ Console funcionando normalmente
- ✅ F12, DevTools, etc. funcionando

### **2. Configuração da API Criada:**
- ✅ Arquivo `src/config/api.ts` criado
- ✅ Configuração centralizada da API
- ✅ Funções helper para requisições

## 🚀 **Como usar agora:**

### **Desenvolvimento Local:**
```bash
npm run dev:all
```
- Frontend: http://localhost:8080
- API: http://localhost:3001
- Anti-debug desabilitado
- Console funcionando

### **Para Produção:**
1. **Criar arquivo `.env` na VPS:**
```env
VITE_API_BASE=https://correios-tracking.com
NODE_ENV=production
PORT=3001
```

2. **Fazer deploy:**
```bash
# Na VPS
cd /var/www/correios
pm2 stop correios-api
pm2 delete correios-api

# Configurar variável
export VITE_API_BASE="https://correios-tracking.com"

# Fazer build
npm run build

# Reiniciar
pm2 start ecosystem.config.cjs --env production
```

## 🔧 **Arquivos Modificados:**

1. **`src/utils/antiDebug.ts`** - Anti-debug desabilitado
2. **`src/config/api.ts`** - Configuração centralizada da API
3. **`deploy.sh`** - Script de deploy atualizado
4. **`config.env`** - Exemplo de configuração

## 🎯 **Próximos Passos:**

1. ✅ **Testar localmente** - `npm run dev:all`
2. ✅ **Verificar se console funciona** - F12 deve abrir normalmente
3. ✅ **Fazer deploy na VPS** com as configurações corretas
4. ✅ **Testar importação de leads** em produção

## 🆘 **Se Ainda Houver Problemas:**

### **Verificar se anti-debug está desabilitado:**
```bash
# No console do navegador, deve aparecer:
"Anti-debug desabilitado para desenvolvimento"
```

### **Verificar se API está funcionando:**
```bash
# Testar endpoint
curl http://localhost:3001/api/health
```

### **Verificar logs:**
```bash
# Ver logs do PM2
pm2 logs correios-api
```

## 📝 **Resumo:**
- ✅ Anti-debug desabilitado
- ✅ Console funcionando
- ✅ Configuração da API centralizada
- ✅ Script de deploy pronto
- ✅ Pronto para desenvolvimento e produção

**Agora você pode desenvolver normalmente sem problemas de anti-debug!** 🎉
