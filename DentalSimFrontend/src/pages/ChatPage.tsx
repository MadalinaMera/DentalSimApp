import React, { useRef, useState } from 'react';
import {
    IonButton, IonContent, IonFooter, IonHeader, IonIcon, IonInput,
    IonLabel, IonList, IonNote, IonPage, IonTitle, IonToolbar, IonSpinner, IonCard, IonCardHeader, IonCardTitle, IonCardContent
} from '@ionic/react';
import { arrowBack, send, flask, chatbubbleEllipses } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';

type Sender = 'student' | 'patient';
interface Message { text: string; sender: Sender; }

const ChatPage: React.FC = () => {
    const history = useHistory();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [caseStarted, setCaseStarted] = useState(false); // Ținem minte dacă am început cazul
    const [activeDisease, setActiveDisease] = useState<string>(""); // (Opțional) Să știm ce boală e (pentru debug)
    const contentRef = useRef<HTMLIonContentElement | null>(null);

    // URL-ul backend-ului Flask (localhost:8000)
    const BASE_URL = "http://localhost:8000";

    // 1. Funcția care PORNEȘTE simularea (Alege boala)
    const startSimulation = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/chat/start/random`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });

            const data = await response.json();

            if (response.ok) {
                setCaseStarted(true);
                // setActiveDisease(data.name); // Dacă vrei să afișezi numele bolii (pentru test)

                // Adăugăm un mesaj de bun venit din partea sistemului (nu de la pacient)
                setMessages([{
                    sender: 'patient',
                    text: "** The pacient has joined the chat. **"
                }]);
            } else {
                alert("Eroare la pornire: " + data.error);
            }
        } catch (error) {
            console.error(error);
            alert("Cannot connect to the server");
        } finally {
            setIsLoading(false);
        }
    };

    // 2. Funcția care TRIMITE mesaje la Llama (Chat)
    const sendMessageToBackend = async (text: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessages(prev => [...prev, { sender: 'patient', text: data.reply }]);
            } else {
                setMessages(prev => [...prev, { sender: 'patient', text: "(Eroare: " + data.error + ")" }]);
            }

        } catch (error) {
            setMessages(prev => [...prev, { sender: 'patient', text: "(Eroare rețea)" }]);
        } finally {
            setIsLoading(false);
            contentRef.current?.scrollToBottom(300);
        }
    };

    const handleSend = () => {
        const text = input.trim();
        if (!text || isLoading) return;

        // Adăugăm mesajul studentului
        setMessages(prev => [...prev, { text, sender: 'student' }]);
        setInput('');

        // Trimitem la backend
        sendMessageToBackend(text);
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonButton slot="start" onClick={() => history.goBack()}>
                        <IonIcon icon={arrowBack} />
                    </IonButton>
                    <IonTitle>Simulator Clinic</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent ref={contentRef} fullscreen className="ion-padding">

                {/* A. Ecranul de START (Dacă nu a început cazul) */}
                {!caseStarted ? (
                    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                        <IonCard style={{ textAlign: 'center', padding: '20px' }}>
                            <IonCardHeader>
                                <IonIcon icon={flask} style={{ fontSize: '64px', color: '#3880ff' }} />
                                <IonCardTitle>Caz Clinic Aleatoriu</IonCardTitle>
                            </IonCardHeader>
                            <IonCardContent>
                                <p>Apasă pe buton pentru a genera un pacient virtual cu una dintre cele 9 afecțiuni studiate.</p>
                                <br />
                                <IonButton expand="block" onClick={startSimulation} disabled={isLoading}>
                                    {isLoading ? <IonSpinner name="crescent" /> : "GENEREAZĂ PACIENT"}
                                </IonButton>
                            </IonCardContent>
                        </IonCard>
                    </div>
                ) : (
                    /* B. Ecranul de CHAT (Dacă a început cazul) */
                    <IonList lines="none">
                        {messages.map((m, i) => (
                            <div key={i} className={`ion-text-${m.sender === 'student' ? 'end' : 'start'} ion-margin-vertical`}>
                                <div style={{ maxWidth: '85%', display: 'inline-block', textAlign: 'left' }}>
                                    <IonLabel
                                        className="ion-padding ion-text-wrap"
                                        style={{
                                            borderRadius: 15,
                                            display: 'block',
                                            background: m.sender === 'student' ? '#3880ff' : '#e0e0e0',
                                            color: m.sender === 'student' ? '#fff' : '#000',
                                        }}
                                    >
                                        {m.text}
                                    </IonLabel>
                                    <IonNote style={{ fontSize: '0.8em', marginLeft: 5 }}>
                                        {m.sender === 'student' ? 'Student' : 'Pacient'}
                                    </IonNote>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="ion-margin-top ion-text-center">
                                <IonSpinner name="dots" color="primary" />
                            </div>
                        )}
                    </IonList>
                )}

            </IonContent>

            {/* Bara de jos apare doar dacă cazul a început */}
            {caseStarted && (
                <IonFooter>
                    <IonToolbar>
                        <IonInput
                            value={input}
                            placeholder="Întreabă pacientul..."
                            onIonChange={e => setInput(e.detail.value!)}
                            onKeyPress={e => e.key === 'Enter' && handleSend()}
                            disabled={isLoading}
                            style={{
                                background: '#f0f0f0',
                                borderRadius: '20px',
                                paddingLeft: '10px',
                                margin: '5px'
                            }}
                        />
                        <IonButton slot="end" onClick={handleSend} disabled={!input.trim() || isLoading}>
                            <IonIcon icon={send} />
                        </IonButton>
                    </IonToolbar>
                </IonFooter>
            )}
        </IonPage>
    );
};

export default ChatPage;