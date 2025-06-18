# 🤝 Contribuindo para o Robingood

Obrigado por seu interesse em contribuir com o Robingood! Este documento contém as diretrizes para contribuir com o projeto.

## 📋 Como Contribuir

### 1. Fork do Projeto
1. Faça um **fork** deste repositório clicando no botão "Fork" no GitHub
2. Clone seu fork para sua máquina local:
   ```bash
   git clone https://github.com/colissi04/robingood.git
   cd robingood
   ```

### 2. Configuração do Ambiente
1. Instale as dependências:
   ```bash
   npm install
   # ou
   yarn install
   ```

2. Adicione o repositório original como upstream:
   ```bash
   git remote add upstream https://github.com/colissi04/robingood.git
   ```

### 3. Criando uma Nova Branch
1. Certifique-se de estar na branch `develop`:
   ```bash
   git checkout develop
   git pull upstream develop
   ```

2. Crie uma nova branch a partir da `develop`:
   ```bash
   git checkout -b feature/nome-da-sua-feature
   # ou
   git checkout -b fix/nome-do-bug-corrigido
   ```

### 4. Fazendo as Alterações
1. Faça suas alterações no código
2. Teste suas mudanças:
   ```bash
   npm start
   # ou
   yarn start
   ```
3. Certifique-se de que tudo está funcionando corretamente

### 5. Commit das Alterações
1. Adicione os arquivos modificados:
   ```bash
   git add .
   ```

2. Faça o commit com uma mensagem descritiva:
   ```bash
   git commit -m "feat: adiciona nova funcionalidade X"
   # ou
   git commit -m "fix: corrige bug na reprodução de vídeo"
   ```

### 6. Enviando para seu Fork
```bash
git push origin feature/nome-da-sua-feature
```

### 7. Abrindo um Pull Request
1. Vá para o seu fork no GitHub
2. Clique em "Compare & pull request"
3. **Importante**: Certifique-se de que o PR está sendo aberto para a branch `develop` do repositório original
4. Preencha o template do PR com:
   - Descrição clara das mudanças
   - Tipo de mudança (feature, bugfix, docs, etc.)
   - Screenshots (se aplicável)

## 🎯 Tipos de Contribuição

### 🐛 Reportar Bugs
- Use o template de issue para bugs
- Inclua passos para reproduzir
- Adicione screenshots se necessário

### ✨ Sugerir Funcionalidades
- Use o template de issue para features
- Explique o problema que a feature resolve
- Descreva a solução proposta

### 📝 Melhorar Documentação
- Correções de typos
- Melhorias na clareza
- Adição de exemplos

### 🎨 Melhorias de UI/UX
- Melhorias visuais
- Acessibilidade
- Responsividade

## 📏 Padrões de Código

### Convenções de Commit
Usamos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Mudanças na documentação
- `style:` - Formatação, sem mudança de lógica
- `refactor:` - Refatoração de código
- `test:` - Adição ou correção de testes
- `chore:` - Tarefas de manutenção

### Estrutura de Branches
- `main` - Versão estável em produção
- `develop` - Branch de desenvolvimento (base para PRs)
- `feature/*` - Novas funcionalidades
- `fix/*` - Correções de bugs
- `hotfix/*` - Correções urgentes

## ✅ Checklist do Pull Request

Antes de abrir seu PR, verifique se:

- [ ] Testei as mudanças localmente
- [ ] Segui os padrões de commit
- [ ] Atualizei a documentação (se necessário)
- [ ] O PR está sendo aberto para a branch `develop`
- [ ] Adicionei descrição clara das mudanças

## 🚀 Processo de Review

1. **Automático**: Verificações de CI/CD
2. **Manual**: Review por maintainers
3. **Aprovação**: Merge na branch `develop`
4. **Release**: Merge da `develop` para `main`

## 🆘 Precisa de Ajuda?

- 📫 Abra uma [issue](https://github.com/colissi04/robingood/issues)
- 💬 Entre em contato com [@rodrigocolissi](https://github.com/colissi04)

---

<div align="center">
  
**Obrigado por contribuir com o Robingood! 🎉**

</div> 