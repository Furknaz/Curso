# Curso de Empréstimo Consignado

Plataforma de ensino online para curso de empréstimo consignado com interface moderna e responsiva.

## 🚀 Deploy no Vercel

### Pré-requisitos
- Conta no [GitHub](https://github.com)
- Conta no [Vercel](https://vercel.com)

### Passos para Deploy

1. **Criar repositório no GitHub:**
   - Acesse [GitHub](https://github.com) e crie um novo repositório
   - Copie a URL do repositório criado

2. **Conectar repositório local ao GitHub:**
   ```bash
   git remote add origin [URL_DO_SEU_REPOSITORIO]
   git branch -M main
   git push -u origin main
   ```

3. **Deploy no Vercel:**
   - Acesse [Vercel](https://vercel.com)
   - Clique em "New Project"
   - Importe seu repositório do GitHub
   - O Vercel detectará automaticamente as configurações do `vercel.json`
   - Clique em "Deploy"

### Deploy Automático

Após a configuração inicial, qualquer push para a branch `main` do GitHub acionará automaticamente um novo deploy no Vercel.

### Comandos Git Úteis

```bash
# Adicionar alterações
git add .

# Fazer commit
git commit -m "Descrição das alterações"

# Enviar para GitHub (aciona deploy automático)
git push
```

## 📁 Estrutura do Projeto

- `index.html` - Página principal
- `modulo*.html` - Páginas dos módulos
- `m*_aula*.html` - Páginas das aulas
- `style.css` - Estilos CSS
- `images/` - Imagens do curso
- `vercel.json` - Configuração do Vercel

## 🛠️ Tecnologias

- HTML5
- CSS3
- JavaScript
- Vercel (Hospedagem)

## 📱 Responsividade

O projeto é totalmente responsivo e funciona em:
- Desktop
- Tablet
- Mobile