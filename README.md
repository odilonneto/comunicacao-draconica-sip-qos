
# 🐉 Comunicação Dracônica com SIP.js + Node.js

Este projeto foi desenvolvido como parte do Trabalho 3 da disciplina **Redes de Computadores 2 (RC28CP)**, com o objetivo de implementar uma aplicação funcional que permita **comunicação de voz entre dragões** usando o protocolo **SIP (Session Initiation Protocol)** e **WebRTC**.

> Dois dragões, Fúria da Noite e Pesadelo Monstruoso, podem se registrar em um servidor SIP feito em Node.js e estabelecer chamadas de voz ponto-a-ponto via navegador.

---

## 📜 Objetivos do Projeto

- Criar uma aplicação multimídia com SIP funcional em JavaScript.
- Permitir chamadas VoIP entre usuários usando apenas navegador.
- Demonstrar conceitos de sinalização SIP e transporte de mídia com WebRTC.

---

## 🚀 Tecnologias Utilizadas

| Tecnologia      | Uso                                    |
|-----------------|----------------------------------------|
| **React**       | Interface do usuário (frontend)        |
| **SIP.js**      | Biblioteca SIP para JavaScript         |
| **WebRTC**      | Transmissão de áudio entre dragões     |
| **Node.js**     | Backend e servidor SIP WebSocket       |
| **WebSocket**   | Canal de comunicação entre SIP.js e servidor SIP |

---

## 📁 Estrutura do Projeto

```
comunicacao-draconica-sip-qos/
├── frontend/           # React + SIP.js
│   ├── src/
│   │   └── App.js
│   └── package.json
├── backend/            # Node.js SIP WebSocket server
│   ├── server.js
│   └── package.json
└── README.md
```

---

## ⚙️ Como Instalar e Executar

> Requisitos:  
> - Node.js instalado (v18+ recomendado)  
> - Navegador moderno (Chrome/Firefox com suporte a WebRTC)

---

### 1️⃣ Clonar o repositório

```bash
git clone https://github.com/odilonneto/comunicacao-draconica-sip-qos.git
cd comunicacao-draconica-sip-qos
```

---

### 2️⃣ Instalar e iniciar o servidor SIP (backend)

```bash
cd backend
npm install
node server.js
```

> O servidor ouvirá em `ws://localhost:8088`.

---

### 3️⃣ Iniciar a interface SIP.js (frontend)

```bash
cd ../frontend
npm install
npm start
```

> A interface abre automaticamente em `http://localhost:3000`.

---

## 🧪 Como Testar

1. Acesse `http://localhost:3000` em duas abas diferentes (ou dois navegadores).
2. Registre um dragão diferente em cada aba (Fúria da Noite e Pesadelo Monstruoso).
3. Use o campo de ramal (ex: `1002`) para ligar de um dragão para outro.
4. Aceite a chamada do outro lado.
5. Converse com você mesmo como dois dragões 🐉🐲.

---

## ✨ Funcionalidades Implementadas

- [x] Registro SIP via WebSocket
- [x] Estabelecimento de chamadas VoIP (INVITE/ACK/BYE)
- [x] Transmissão de áudio com WebRTC
- [x] Interface React amigável
- [x] Encerramento e rejeição de chamadas
- [x] Código documentado para fins acadêmicos

---

## 👤 Acadêmicos
1. Allef Fernandes Santos
2. Odilon Ramos da Silva Neto
