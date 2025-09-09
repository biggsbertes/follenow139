# 🚀 Instruções de Deploy - Correios API

## ✅ **Problema Resolvido!**

Agora sua API tem uma **página inicial bonita** que mostra todos os endpoints disponíveis!

## 📋 **Como Fazer o Deploy na VPS:**

### **1. Conectar na VPS**
```bash
ssh usuario@seu-ip-da-vps
```

### **2. Parar a Aplicação Atual**
```bash
pm2 stop correios-api
pm2 delete correios-api
```

### **3. Fazer Upload dos Arquivos Corrigidos**

#### **Opção A: Via SCP (recomendado)**
```bash
# No seu computador local:
scp -r . usuario@seu-ip-da-vps:/var/www/correios/
```

#### **Opção B: Via Git**
```bash
# Na VPS:
cd /var/www/correios
git pull origin main
```

#### **Opção C: Upload Manual**
- Use FileZilla, WinSCP ou similar
- Faça upload de todos os arquivos para `/var/www/correios/`

### **4. Verificar se as Correções Foram Aplicadas**
```bash
# Verificar se o trust proxy está configurado
grep -n "trust proxy" /var/www/correios/server.mjs

# Deve mostrar:
# 15:// Configurar trust proxy para funcionar com Nginx
# 16:app.set('trust proxy', 1); // Confiar no primeiro proxy (Nginx)
```

### **5. Reinstalar Dependências**
```bash
cd /var/www/correios
npm install
```

### **6. Reiniciar a Aplicação**
```bash
# Usar o script de deploy
chmod +x deploy.sh
./deploy.sh

# OU manualmente:
pm2 start ecosystem.config.cjs --env production
pm2 save
```

### **7. Verificar se Funcionou**
```bash
# Ver logs
pm2 logs correios-api --lines 20

# Testar a página inicial
curl http://localhost:3001/

# Testar a API
curl http://localhost:3001/api/health
```

## 🎯 **O que Você Vai Ver Agora:**

### **Página Inicial (http://seu-dominio.com/)**
- ✅ Página bonita com todos os endpoints
- ✅ Status da API
- ✅ Links para testar cada endpoint
- ✅ Informações do servidor

### **Endpoints Funcionando:**
- ✅ `/api/health` - Status da API
- ✅ `/api/status` - Status detalhado
- ✅ `/api/leads` - Listar leads
- ✅ `/api/payments` - Pagamentos
- ✅ E todos os outros endpoints

## 🔧 **Se Ainda Houver Problemas:**

### **Verificar Logs:**
```bash
pm2 logs correios-api
```

### **Verificar se o Trust Proxy Está Ativo:**
```bash
grep -A 5 "trust proxy" /var/www/correios/server.mjs
```

### **Verificar Nginx:**
```bash
sudo nginx -t
sudo systemctl status nginx
```

## 🎉 **Resultado Final:**

Depois do deploy, quando você acessar `http://seu-dominio.com/`, você verá:

1. **Página inicial bonita** com todos os endpoints
2. **Sem mais erros** de trust proxy
3. **API funcionando perfeitamente**
4. **Rate limiting funcionando** com Nginx

## 📞 **Precisa de Ajuda?**

Se tiver algum problema durante o deploy, me avise que te ajudo passo a passo!

---

**Resumo:** Agora você tem uma API completa com página inicial bonita e todas as correções para funcionar perfeitamente na VPS! 🚀
