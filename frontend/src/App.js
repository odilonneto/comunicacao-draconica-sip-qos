import React, { useState, useRef } from 'react';
import { UserAgent, Inviter, Invitation, Registerer } from 'sip.js';
import './App.css';

const server = 'ws://127.0.0.1:8088';
const domain = 'dragons.local';

const dragonsConfig = {
  fuira_da_noite: { uri: `sip:1001@${domain}` },
  pesadelo_monstruoso: { uri: `sip:1002@${domain}` },
};

function App() {
  const [userAgent, setUserAgent] = useState(null);
  const [registerer, setRegisterer] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [callState, setCallState] = useState('Desconectado');
  const [destination, setDestination] = useState('');
  const [activeCall, setActiveCall] = useState(null);
  const [currentDragon, setCurrentDragon] = useState('');

  const remoteAudioRef = useRef(null);
  const localAudioRef = useRef(null);

  const handleRegister = async (dragon) => {
    if (userAgent) await userAgent.stop();

    const config = dragonsConfig[dragon];
    const ua = new UserAgent({
      uri: UserAgent.makeURI(config.uri),
      transportOptions: { server },
      delegate: {
        onInvite: (invitation) => {
          console.log("Recebendo chamada!");
          setCallState('Recebendo chamada...');
          setActiveCall(invitation);
          setupCallHandlers(invitation);
        }
      },
      sessionDescriptionHandlerFactoryOptions: {
        peerConnectionConfiguration: {
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        }
      }
    });

    try {
      await ua.start();
      setUserAgent(ua);

      const reg = new Registerer(ua);
      reg.stateChange.addListener((state) => {
        console.log("Estado do registrador:", state);
        if (state === 'Registered') {
          setIsRegistered(true);
          setCallState('Registrado');
          setCurrentDragon(dragon);
        }
        if (state === 'Unregistered') {
          setIsRegistered(false);
          setCallState('Desconectado');
          setCurrentDragon('');
        }
      });

      await reg.register();
      setRegisterer(reg);
    } catch (e) {
      console.error("Erro ao registrar:", e);
      setCallState('Erro de conexão');
    }
  };

  const handleCall = async () => {
    if (!userAgent || !isRegistered) {
      alert('Registre um dragão primeiro.');
      return;
    }

    const target = UserAgent.makeURI(`sip:${destination}@${domain}`);
    if (!target) return console.error("URI de destino inválido");

    const inviter = new Inviter(userAgent, target);
    setActiveCall(inviter);
    setupCallHandlers(inviter);

    try {
      await inviter.invite();
      setCallState('Chamando...');
    } catch (e) {
      console.error("Erro ao chamar:", e);
      setCallState('Erro na chamada');
    }
  };

  const handleAcceptCall = async () => {
    if (!activeCall || !(activeCall instanceof Invitation)) return;
    try {
      await activeCall.accept();
    } catch (err) {
      console.error("Erro ao aceitar chamada", err);
    }
  };

  const handleHangup = () => {
    if (!activeCall) return;

    if (activeCall.state === 'Established') {
      activeCall.bye();
    } else if (activeCall instanceof Inviter && ['Initial', 'Establishing'].includes(activeCall.state)) {
      activeCall.cancel();
    } else if (activeCall instanceof Invitation && activeCall.state === 'Initial') {
      activeCall.reject();
    }

    setActiveCall(null);
    setCallState('Registrado');
  };

  const setupCallHandlers = (call) => {
    call.stateChange.addListener(async (state) => {
      console.log(`Estado da chamada: ${state}`);
      setCallState(`Status: ${state}`);

      const pc = call.sessionDescriptionHandler?.peerConnection;

      if (pc) {
        pc.oniceconnectionstatechange = () => {
          console.log("ICE connection state:", pc.iceConnectionState);
        };

        pc.ontrack = (event) => {
          console.log("ontrack acionado");
          remoteAudioRef.current.srcObject = event.streams[0];
        };
      }

      if (state === 'Establishing') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          localAudioRef.current.srcObject = stream;

          if (pc) {
            stream.getTracks().forEach(track => pc.addTrack(track, stream));
          }
        } catch (err) {
          console.error("Erro ao acessar microfone:", err);
        }
      }

      if (state === 'Terminated') {
        setActiveCall(null);
        setCallState('Registrado');
      }
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🐉 Comunicação Dracônica</h1>
        <h2 style={{ color: isRegistered ? 'lightgreen' : 'orange' }}>{callState}</h2>
        {currentDragon && <h3 style={{ color: 'lightblue' }}>Dragão: {currentDragon.toUpperCase()}</h3>}

        {!isRegistered ? (
          <div className="control-box">
            <h3>Escolha seu Dragão:</h3>
            <button onClick={() => handleRegister('fuira_da_noite')}>🌑 Fúria da Noite (1001)</button>
            <button onClick={() => handleRegister('pesadelo_monstruoso')}>🔥 Pesadelo Monstruoso (1002)</button>
          </div>
        ) : (
          <div className="control-box">
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Digite o ramal (ex: 1002)"
            />
            <button onClick={handleCall} disabled={!!activeCall}>📞 Ligar</button>
            <button onClick={handleHangup} disabled={!activeCall}>📵 Desligar</button>
          </div>
        )}

        {activeCall && activeCall instanceof Invitation && activeCall.state === 'Initial' && (
          <div className="control-box ringing">
            <h3>Chamada recebida!</h3>
            <button onClick={handleAcceptCall}>✅ Aceitar</button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;