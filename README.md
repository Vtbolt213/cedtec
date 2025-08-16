# CEDTEC Tickets - Mobile App

Sistema de gerenciamento de tickets de TI para Escola CEDTEC desenvolvido em React Native com Expo.

## 🚀 Tecnologias

- **React Native** com Expo
- **TypeScript** para tipagem estática
- **Expo Router** para navegação
- **Supabase** para backend e autenticação
- **Zustand** para gerenciamento de estado
- **React Hook Form** para formulários
- **Expo SecureStore** para armazenamento seguro

## 📱 Funcionalidades

### Para Professores:
- ✅ Criar chamados técnicos
- ✅ Visualizar seus tickets
- ✅ Acompanhar status dos chamados
- ✅ Adicionar comentários

### Para Administradores:
- ✅ Visualizar todos os tickets
- ✅ Alterar status dos chamados
- ✅ Gerenciar tickets de todos os usuários
- ✅ Dashboard com estatísticas

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- Expo CLI
- Conta no Supabase

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar Supabase
1. Crie um projeto no [Supabase](https://supabase.com)
2. Configure as variáveis de ambiente no arquivo `src/lib/supabase.ts`
3. Execute as migrações do banco de dados

### 3. Executar o projeto

#### Desenvolvimento
```bash
# Iniciar o servidor de desenvolvimento
npm start

# Para Android
npm run android

# Para iOS
npm run ios

# Para Web
npm run web
```

#### Build para produção
```bash
# Android
npm run build:android

# iOS
npm run build:ios
```

## 📁 Estrutura do Projeto

```
├── app/                    # Rotas do Expo Router
│   ├── (auth)/            # Telas de autenticação
│   ├── (tabs)/            # Telas principais com tabs
│   └── _layout.tsx        # Layout raiz
├── src/
│   ├── lib/               # Configurações (Supabase)
│   └── stores/            # Gerenciamento de estado (Zustand)
├── assets/                # Imagens e ícones
└── app.json              # Configuração do Expo
```

## 🔐 Autenticação

O sistema usa autenticação baseada em email/senha através do Supabase:
- Emails são gerados automaticamente: `username@cedtec.local`
- Suporte a dois tipos de usuário: Professor e Administrador
- Armazenamento seguro de credenciais com Expo SecureStore

## 📊 Banco de Dados

### Tabelas principais:
- `profiles` - Perfis dos usuários
- `tickets` - Chamados técnicos
- `ticket_interactions` - Comentários e interações

### Tipos de Problema:
- 🌐 Rede
- 🖥️ Hardware
- 💻 Software
- 📽️ Projetor
- 🔧 Outros

### Status dos Tickets:
- 🔴 Aberto
- 🟡 Em andamento
- 🟢 Resolvido

### Prioridades:
- Baixa
- Normal
- Alta
- Urgente

## 🎨 Design

- Interface nativa para iOS e Android
- Design system consistente
- Navegação por tabs
- Tema baseado na identidade visual da CEDTEC
- Suporte a modo claro

## 📱 Funcionalidades Mobile

- ✅ Navegação nativa
- ✅ Pull-to-refresh
- ✅ Armazenamento offline
- ✅ Notificações push (futuro)
- ✅ Câmera para anexos (futuro)

## 🚀 Deploy

### Expo Application Services (EAS)
```bash
# Configurar EAS
eas build:configure

# Build para Android
eas build --platform android

# Build para iOS
eas build --platform ios

# Submit para stores
eas submit --platform android
eas submit --platform ios
```

## 📄 Licença

Este projeto é propriedade da Escola CEDTEC.

## 👥 Contribuição

Para contribuir com o projeto:
1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Abra um Pull Request

## 📞 Suporte

Para suporte técnico, entre em contato com a equipe de TI da CEDTEC.