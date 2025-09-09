# 🚀 Correios API - Sistema de Gestão de Leads e Pagamentos

Sistema completo para gestão de leads e processamento de pagamentos com integração PIX.

## ✨ Funcionalidades

- 📊 **Gestão de Leads**: Importação, consulta e gerenciamento de leads
- 💰 **Pagamentos PIX**: Integração com gateway de pagamento
- 🔍 **Rastreamento**: Sistema de tracking de encomendas
- 📈 **Métricas**: Dashboard com estatísticas em tempo real
- 🔒 **Segurança**: Rate limiting, autenticação e validações
- 🚀 **Performance**: Cache, compressão e otimizações

## 🛠️ Tecnologias

- **Backend**: Node.js + Express
- **Frontend**: React + Vite + TypeScript
- **Database**: SQLite com Better-SQLite3
- **UI**: Tailwind CSS + Shadcn/ui
- **Pagamentos**: Integração PIX
- **Deploy**: PM2 + Nginx

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação Local
```bash
# Clonar repositório
git clone <seu-repositorio>
cd correios-tela

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Executar em desenvolvimento
npm run dev:all
```

### Scripts Disponíveis
```bash
npm run dev          # Frontend React (porta 8080)
npm run server       # Backend API (porta 3001)
npm run dev:all      # Ambos simultaneamente
npm run build        # Build para produção
npm run preview      # Preview do build
```

## 🔧 Configuração

### Variáveis de Ambiente (.env)
```env
# Servidor
PORT=3001
NODE_ENV=development

# Pagamentos PIX
HYDRA_PK=sua_chave_publica
HYDRA_SK=sua_chave_secreta
HYDRA_PK_NFE=chave_nfe_publica
HYDRA_SK_NFE=chave_nfe_secreta
HYDRA_PK_REAGENDAMENTO=chave_reagendamento_publica
HYDRA_SK_REAGENDAMENTO=chave_reagendamento_secreta

# Configurações de Taxa
TAX_PERCENT=50
USD_BRL_RATE_CENTS=520
TARIFA_BRL_DEFAULT=6471

# Segurança
IMPORT_SECRET=seu_token_secreto
POSTBACK_URL=https://seu-dominio.com/webhook
```

## 🚀 Deploy

### Deploy Automatizado
```bash
# Tornar script executável
chmod +x deploy.sh

# Executar deploy
./deploy.sh
```

### Deploy Manual
```bash
# Build do frontend
npm run build

# Iniciar com PM2
pm2 start ecosystem.config.cjs --env production
pm2 save
```

### Configuração Nginx
Use o arquivo `nginx-config.conf` como base para configurar o Nginx.

## 📊 API Endpoints

### Leads
- `GET /api/leads` - Listar leads
- `GET /api/leads/search` - Buscar leads
- `GET /api/leads/by-tracking/:code` - Buscar por tracking
- `GET /api/leads/metrics` - Métricas de leads
- `POST /api/leads/import` - Importar leads
- `PUT /api/leads/:id` - Atualizar lead
- `DELETE /api/leads/:id` - Deletar lead

### Pagamentos
- `GET /api/payments/recent` - Pagamentos recentes
- `GET /api/payments/metrics` - Métricas de pagamentos
- `GET /api/payments/by-tracking/:code` - Pagamentos por tracking
- `POST /api/payments/pix` - Criar pagamento PIX
- `POST /api/payments/webhook` - Webhook de pagamento

### Sistema
- `GET /api/health` - Status da API
- `GET /api/status` - Status detalhado
- `GET /` - Frontend React

## 🔒 Segurança

- **Rate Limiting**: Proteção contra spam
- **CORS**: Configurado para produção
- **Trust Proxy**: Configurado para Nginx
- **Validação**: Validação de dados de entrada
- **Autenticação**: Token para importação segura

## 📈 Performance

- **Cache**: Cache em memória para consultas frequentes
- **Compressão**: Gzip para otimização
- **Índices**: Índices otimizados no banco
- **Batch Processing**: Processamento em lotes
- **Connection Pooling**: Pool de conexões otimizado

## 🐛 Solução de Problemas

### Erro de Trust Proxy
```bash
# Verificar se está configurado
grep -n "trust proxy" server.mjs
```

### Erro de Upload
- Limite atual: 500MB
- Processamento em lotes de 1000 registros
- Logs detalhados de progresso

### Logs
```bash
# PM2 logs
pm2 logs correios-api

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

## 📝 Licença

Este projeto é privado e confidencial.

## 🤝 Suporte

Para suporte técnico, entre em contato com a equipe de desenvolvimento.

---

**Desenvolvido com ❤️ para otimizar a gestão de leads e pagamentos**
