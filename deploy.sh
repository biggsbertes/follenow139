#!/bin/bash

echo "🚀 Iniciando deploy do Correios API..."

# Parar o PM2 se estiver rodando
echo "⏹️ Parando aplicação atual..."
pm2 stop correios || true
pm2 delete correios || true

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Configurar variáveis de ambiente para produção
echo "🔧 Configurando variáveis de ambiente..."
cp env-production.txt .env
export VITE_API_BASE="https://correios-tracking.com"

# Fazer build do frontend React
echo "🏗️ Fazendo build do frontend..."
npm run build

# Criar diretório de logs se não existir
echo "📁 Criando diretório de logs..."
mkdir -p logs

# Iniciar aplicação com PM2
echo "🔄 Iniciando aplicação com PM2..."
pm2 start ecosystem.config.cjs --env production

# Salvar configuração do PM2
echo "💾 Salvando configuração do PM2..."
pm2 save

# Mostrar status
echo "📊 Status da aplicação:"
pm2 status

echo "✅ Deploy concluído!"
echo "🌐 Aplicação rodando em: http://localhost:3001"
echo "📊 Monitoramento: http://localhost:3001/api/status"
