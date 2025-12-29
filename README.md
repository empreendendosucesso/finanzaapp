
# 💰 Finanza AI - Gestão Financeira Inteligente

Sistema de controle financeiro com dashboard visual e análise de gastos por IA.

## 🛠️ Como resolver o erro de Deploy (Get Pages site failed)

O erro na aba Actions ocorre porque o GitHub precisa de sua permissão manual para usar o Actions como fonte de publicação.

1. No seu repositório no GitHub, clique em **Settings** (Configurações).
2. No menu lateral, clique em **Pages**.
3. Em **Build and deployment** > **Source**, mude de "Deploy from a branch" para **GitHub Actions**.
4. Vá na aba **Actions** e você verá que o próximo deploy funcionará automaticamente.

## 🔑 Configuração da Inteligência Artificial (Gemini)

Para que o botão "Consultar IA" funcione no site publicado:
1. Vá em **Settings** > **Secrets and variables** > **Actions**.
2. Clique em **New repository secret**.
3. Nome: `API_KEY`.
4. Valor: (Sua chave do Google AI Studio).

## 🚀 Tecnologias
- React 19
- Tailwind CSS
- Recharts (Gráficos)
- Lucide Icons
- Gemini 2.5 Flash (IA)
