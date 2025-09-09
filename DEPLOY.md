# 🚀 Guia de Deploy - Correios API

## 📋 Pré-requisitos

- Node.js 18+ instalado
- PM2 instalado globalmente: `npm install -g pm2`
- Nginx instalado e configurado
- Certificado SSL (Let's Encrypt recomendado)

## 🔧 Correções Aplicadas

### 1. Trust Proxy Configuration
- Adicionado `app.set('trust proxy', 1)` para funcionar com Nginx
- Configurado `trustProxy: true` em todos os rate limiters

### 2. Rate Limiting
- Configurado para funcionar corretamente com proxies reversos
- Mantém a funcionalidade de rate limiting sem conflitos

## 📦 Deploy na VPS

### 1. Preparar o Servidor
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 globalmente
sudo npm install -g pm2

# Instalar Nginx
sudo apt install nginx -y
```

### 2. Configurar o Projeto
```bash
# Clonar ou fazer upload do projeto
cd /var/www/
sudo mkdir -p correios
sudo chown -R $USER:$USER /var/www/correios
cd /var/www/correios

# Copiar arquivos do projeto
# (copie todos os arquivos do projeto para esta pasta)

# Instalar dependências
npm install

# Tornar o script de deploy executável
chmod +x deploy.sh
```

### 3. Configurar Nginx
```bash
# Copiar configuração do Nginx
sudo cp nginx-config.conf /etc/nginx/sites-available/correios-api

# Editar o arquivo com seu domínio
sudo nano /etc/nginx/sites-available/correios-api

# Ativar o site
sudo ln -s /etc/nginx/sites-available/correios-api /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 4. Configurar SSL (Let's Encrypt)
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com

# Testar renovação automática
sudo certbot renew --dry-run
```

### 5. Deploy da Aplicação
```bash
# Executar script de deploy
./deploy.sh

# Ou manualmente:
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup
```

## 🔍 Verificação

### 1. Verificar Status da Aplicação
```bash
pm2 status
pm2 logs correios
```

### 2. Testar API
```bash
# Health check
curl https://seu-dominio.com/api/health

# Status do servidor
curl https://seu-dominio.com/api/status
```

### 3. Verificar Logs
```bash
# Logs da aplicação
pm2 logs correios

# Logs do Nginx
sudo tail -f /var/log/nginx/correios-api.access.log
sudo tail -f /var/log/nginx/correios-api.error.log
```

## 🛠️ Comandos Úteis

### PM2
```bash
# Reiniciar aplicação
pm2 restart correios

# Parar aplicação
pm2 stop correios

# Ver logs em tempo real
pm2 logs correios --lines 100

# Monitorar recursos
pm2 monit
```

### Nginx
```bash
# Testar configuração
sudo nginx -t

# Recarregar configuração
sudo systemctl reload nginx

# Reiniciar Nginx
sudo systemctl restart nginx
```

## 🔒 Segurança

### Firewall
```bash
# Configurar UFW
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Variáveis de Ambiente
Certifique-se de configurar todas as variáveis necessárias no arquivo `.env`:
- `HYDRA_PK` e `HYDRA_SK` para pagamentos
- `HYDRA_PK_NFE` e `HYDRA_SK_NFE` para NFe
- `HYDRA_PK_REAGENDAMENTO` e `HYDRA_SK_REAGENDAMENTO` para reagendamento
- `IMPORT_SECRET` para importação segura
- Outras configurações de taxa e moeda

## 📊 Monitoramento

A aplicação inclui endpoints de monitoramento:
- `/api/health` - Status básico
- `/api/status` - Status detalhado com métricas
- `/api/leads/metrics` - Métricas de leads
- `/api/payments/metrics` - Métricas de pagamentos

## 🆘 Solução de Problemas

### Erro de Trust Proxy
Se ainda houver problemas com trust proxy, verifique:
1. Nginx está configurado corretamente
2. Headers X-Forwarded-For estão sendo enviados
3. Aplicação está rodando na porta correta

### Rate Limiting
Se houver problemas com rate limiting:
1. Verifique se `trustProxy: true` está configurado
2. Confirme que `app.set('trust proxy', 1)` está ativo
3. Teste com diferentes IPs

### SSL/HTTPS
Se houver problemas com SSL:
1. Verifique se o certificado está válido
2. Confirme se o Nginx está redirecionando HTTP para HTTPS
3. Teste com `curl -k` para ignorar verificação SSL
