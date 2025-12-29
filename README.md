
# 💰 Finanza AI - GitHub Pages Ready

Sistema de controle financeiro pessoal com dashboard visual e análise de gastos por Inteligência Artificial.

## 🚀 Como colocar no GitHub Pages

1. **Repositório**: Crie um novo repositório no GitHub (ex: `finanza-ai`).
2. **Push**: Envie seus arquivos para lá.
3. **Deploy**:
   - Vá em **Settings** > **Pages** no seu repositório GitHub.
   - Em **Build and deployment**, selecione **GitHub Actions** como a fonte.
   - O GitHub oferecerá um workflow do **Static HTML** ou **Vite**. Escolha o de **Static HTML** ou configure o build automático.

### Alternativa Manual (Build Local):
1. Rode `npm run build` no seu computador.
2. Uma pasta `dist` será criada.
3. Suba apenas o **conteúdo** da pasta `dist` para o seu repositório ou para o branch `gh-pages`.

## 🔑 Como configurar a IA?
Como o GitHub Pages é público, a chave de API não deve ser colocada no código.
1. Abra seu site no navegador.
2. Clique no ícone de **Engrenagem** (Configurações).
3. Cole sua chave do [Google AI Studio](https://aistudio.google.com/).
4. A chave ficará salva com segurança apenas no **seu** navegador.

## 🛡️ Privacidade
- Dados financeiros: **Local Storage** (Ficam no seu computador).
- Análise de IA: O texto das transações é enviado para o Google Gemini apenas quando você clica em "Analisar".
