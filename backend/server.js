const sip = require('sip');
const WebSocket = require('ws');

// Registro dos dragões
const dragons = {};

const wss = new WebSocket.Server({ port: 8088 });
console.log('Servidor WebSocket ouvindo na porta 8088');

wss.on('connection', (ws) => {
  console.log('Nova conexão WebSocket de um dragão.');

  ws.on('message', (message) => {
    try {
      const req = sip.parse(message.toString());
      const fromUri = req.headers.from?.uri;
      const toUri = req.headers.to?.uri;

      if (req.method === 'REGISTER') {
        console.log(`REGISTER recebido de ${toUri}`);
        dragons[toUri] = ws;

        const res = sip.makeResponse(req, 200, 'OK');
        res.headers.contact = req.headers.contact;
        res.headers.via = req.headers.via;
        ws.send(sip.stringify(res));
        return;
      }

      if (req.method === 'INVITE') {
        console.log(`INVITE de ${fromUri} para ${toUri}`);
        const dest = dragons[toUri];

        if (dest) {
          const trying = sip.makeResponse(req, 100, 'Trying');
          trying.headers.via = req.headers.via;
          ws.send(sip.stringify(trying));
          dest.send(message.toString());
        } else {
          const notFound = sip.makeResponse(req, 404, 'Not Found');
          notFound.headers.via = req.headers.via;
          ws.send(sip.stringify(notFound));
        }
        return;
      }

      // Para todas as outras mensagens SIP
      let senderUri = Object.keys(dragons).find(uri => dragons[uri] === ws);
      if (!senderUri) return console.warn("Mensagem de cliente não registrado.");

      const destinationUri = (fromUri === senderUri) ? toUri : fromUri;
      const destinationSocket = dragons[destinationUri];

      if (destinationSocket) {
        const tipo = req.method || req.statusCode;
        console.log(`Encaminhando ${tipo} de ${senderUri} para ${destinationUri}`);
        destinationSocket.send(message.toString());
      } else {
        console.warn(`Destino ${destinationUri} não encontrado para ${req.method}.`);
      }

    } catch (e) {
      console.error("Erro ao processar SIP:", e);
    }
  });

  ws.on('close', () => {
    const uriFechada = Object.keys(dragons).find(uri => dragons[uri] === ws);
    if (uriFechada) {
      delete dragons[uriFechada];
      console.log(`Conexão encerrada. ${uriFechada} removido.`);
    }
  });
});