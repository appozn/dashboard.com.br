# OZNEH IA - Sinais Inteligentes de Criptomoedas

![OZNEH IA](assets/logo.png)

## 🚀 Sobre o Projeto

OZNEH IA é uma plataforma avançada de sinais de trading de criptomoedas que combina análise técnica em tempo real com inteligência artificial para ajudar traders a tomar decisões mais informadas no mercado de criptomoedas.

### ✨ Recursos Principais

- **📊 Análise em Tempo Real**: Dados ao vivo da Binance com atualizações instantâneas
- **🤖 Sinais Alimentados por IA**: Algoritmos avançados usando RSI, MACD e Médias Móveis
- **⚡ Alertas Instantâneos**: Notificações em tempo real de oportunidades de trading
- **📈 Gráficos Interativos**: Visualização profissional de tendências de mercado
- **🔒 Seguro & Confiável**: Criptografia de chaves API
- **💼 Rastreamento de Portfólio**: Monitore seu desempenho em um só lugar

## 🎨 Design

- **Tema**: Azul escuro premium com efeitos glassmorphism
- **Tipografia**: Inter (Google Fonts)
- **Animações**: Transições suaves e micro-interações
- **Responsivo**: Otimizado para desktop, tablet e mobile

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Gráficos**: Chart.js
- **API**: Binance REST API & WebSocket
- **Análise Técnica**: RSI, MACD, EMA, SMA

## 📦 Instalação

1. Clone ou baixe o repositório
2. Navegue até a pasta do projeto:
   ```bash
   cd "OZNEH IA"
   ```

3. Instale as dependências:
   ```bash
   npm install
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

5. Abra seu navegador em `http://localhost:3000`

## 🎯 Como Usar

### Landing Page
- Acesse `index.html` para ver a página inicial
- Navegue pelas seções: Recursos, Sobre, Planos
- Os preços são automaticamente ajustados para BRL ou USD baseado na localização

### Dashboard
- Acesse `dashboard.html` para o painel de controle
- Visualize preços em tempo real de múltiplas criptomoedas
- Receba sinais de compra/venda baseados em análise técnica
- Monitore gráficos interativos e estatísticas

## 📊 Indicadores Técnicos

### RSI (Relative Strength Index)
- **< 30**: Oversold (Sobrevendido) - Sinal de COMPRA
- **> 70**: Overbought (Sobrecomprado) - Sinal de VENDA
- **30-70**: Zona neutra

### MACD (Moving Average Convergence Divergence)
- Detecta mudanças de momentum
- Crossover bullish/bearish

### Médias Móveis
- **SMA 20/50**: Identifica tendências de curto/médio prazo
- **EMA 12/26**: Responde mais rápido a mudanças de preço

## 💰 Planos de Assinatura

### Básico - R$ 49/mês (USD $9.99)
- Até 3 criptomoedas
- Sinais básicos
- Dados em tempo real

### Pro - R$ 99/mês (USD $19.99) ⭐ MAIS POPULAR
- Criptomoedas ilimitadas
- Sinais avançados com IA
- Alertas em tempo real
- Análise de portfólio

### Enterprise - R$ 199/mês (USD $39.99)
- Tudo do plano Pro
- API personalizada
- Estratégias customizadas
- Suporte dedicado

## 🔐 Segurança

- Todas as conexões com a Binance são feitas via HTTPS/WSS
- Chaves API nunca são armazenadas no servidor
- Apenas leitura de dados (sem permissões de trading automático)

## ⚠️ Aviso de Risco

Trading de criptomoedas envolve risco significativo de perda. Os sinais fornecidos são apenas para fins informativos e educacionais. Não constituem aconselhamento financeiro. Sempre faça sua própria pesquisa (DYOR) antes de tomar decisões de investimento.

## 📝 Estrutura do Projeto

```
OZNEH IA/
├── index.html              # Landing page
├── dashboard.html          # Dashboard principal
├── css/
│   ├── styles.css         # Estilos globais e landing page
│   └── dashboard.css      # Estilos do dashboard
├── js/
│   ├── pricing.js         # Detecção de moeda e preços
│   ├── binance.js         # Integração com Binance API
│   ├── signals.js         # Engine de sinais de trading
│   └── dashboard.js       # Controlador do dashboard
├── assets/
│   └── logo.png           # Logo OZNEH IA
├── package.json           # Dependências do projeto
└── README.md             # Este arquivo
```

## 🚀 Próximos Passos

- [ ] Implementar autenticação de usuários
- [ ] Adicionar integração com gateway de pagamento
- [ ] Criar sistema de alertas por email/SMS
- [ ] Implementar backtesting de estratégias
- [ ] Adicionar mais exchanges (Coinbase, Kraken, etc.)
- [ ] Desenvolver app mobile (React Native)

## 📞 Suporte

Para suporte e dúvidas, entre em contato:
- Email: suporte@oznehia.com
- Website: https://oznehia.com

## 📄 Licença

MIT License - Sinta-se livre para usar este projeto para fins educacionais.

---

**OZNEH IA** - Sinais inteligentes para traders inteligentes 🚀
