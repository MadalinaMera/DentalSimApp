import React, { useRef, useState } from 'react';
import {
    IonButton, IonContent, IonFooter, IonHeader, IonIcon, IonInput,
    IonLabel, IonList, IonPage, IonTitle, IonToolbar, IonSpinner,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonModal,
    IonTextarea
} from '@ionic/react';
import { arrowBack, send, flask, clipboard, close, checkmarkCircle, alertCircle } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';

import './ChatPage.css';

type Sender = 'student' | 'patient';
interface Message { text: string; sender: Sender; }

const ChatPage: React.FC = () => {
    const history = useHistory();

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [caseStarted, setCaseStarted] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [diagnosis, setDiagnosis] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // Separate loading state for diagnosis
    const [showResultModal, setShowResultModal] = useState(false);
    const [resultData, setResultData] = useState({ correct: false, message: '' });
    const contentRef = useRef<HTMLIonContentElement | null>(null);
    const BASE_URL = "http://localhost:8000";

    const startSimulation = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/chat/start/random`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({})
            });

            const data = await response.json();

            if (response.ok) {
                setCaseStarted(true);
                setMessages([{
                    sender: 'patient',
                    text: "** The patient has entered the office. **"
                }]);
            } else {
                alert("Error starting: " + data.error);
            }
        } catch (error) {
            console.error(error);
            alert("Cannot connect to the server.");
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessageToBackend = async (text: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/chat`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({message: text}),
            });

            const data = await response.json();

            if (response.ok) {
                setMessages(prev => [...prev, {sender: 'patient', text: data.reply}]);
            } else {
                setMessages(prev => [...prev, {sender: 'patient', text: "(Error: " + data.error + ")"}]);
            }

        } catch (error) {
            setMessages(prev => [...prev, {sender: 'patient', text: "(Network error)"}]);
        } finally {
            setIsLoading(false);
            contentRef.current?.scrollToBottom(300);
        }
    };

    const handleSend = () => {
        const text = input.trim();
        if (!text || isLoading) return;

        setMessages(prev => [...prev, {text, sender: 'student'}]);
        setInput('');
        sendMessageToBackend(text);
    };

    const handleSendDiagnosis = async () => {
        if (!diagnosis.trim()) return;

        setIsSubmitting(true);

        try {
            const response = await fetch(`${BASE_URL}/chat/diagnose`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ diagnosis: diagnosis })
            });

            const data = await response.json();

            if (response.ok) {
                setShowModal(false);

                setDiagnosis('');

                setResultData({
                    correct: data.correct,
                    message: data.message
                });
                setShowResultModal(true);
            } else {
                alert("Error submitting diagnosis: " + (data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Network error submitting diagnosis:", error);
            alert("Network error. Please check your connection.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseResult = () => {
        setShowResultModal(false);
        setCaseStarted(false);
        setMessages([]);
        setDiagnosis('');
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonButton slot="start" onClick={() => history.goBack()}>
                        <IonIcon icon={arrowBack}/>
                    </IonButton>
                    <IonTitle>Clinical Simulator</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent ref={contentRef} fullscreen className="ion-padding" style={{'--background': '#f4f5f8'}}>

                {!caseStarted ? (
                    <div style={{display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center'}}>
                        <IonCard style={{ textAlign: 'center', padding: '20px' }}>
                            <IonCardHeader>
                                <IonIcon icon={flask} style={{ fontSize: '64px', color: '#3880ff' }} />
                                <IonCardTitle>Random Clinical Case</IonCardTitle>
                            </IonCardHeader>
                            <IonCardContent>
                                <p>Press the button to generate a virtual patient.</p>
                                <br />
                                <IonButton expand="block" onClick={startSimulation} disabled={isLoading}>
                                    {isLoading ? <IonSpinner name="crescent" /> : "GENERATE PATIENT"}
                                </IonButton>
                            </IonCardContent>
                        </IonCard>
                    </div>
                ) : (
                    // --- CHAT SCREEN ---
                    <IonList lines="none" style={{background: 'transparent'}}>
                        {messages.map((m, i) => (
                            <div key={i}
                                 className={`ion-text-${m.sender === 'student' ? 'end' : 'start'} ion-margin-vertical`}>
                                <div style={{maxWidth: '85%', display: 'inline-block', textAlign: 'left'}}>
                                    <IonLabel
                                        className="ion-padding ion-text-wrap"
                                        style={{
                                            borderRadius: 18,
                                            display: 'block',
                                            background: m.sender === 'student' ? '#3880ff' : '#ffffff',
                                            color: m.sender === 'student' ? '#fff' : '#000',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                        }}
                                    >
                                        {m.text}
                                    </IonLabel>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="ion-margin-top ion-text-center">
                                <IonSpinner name="dots" color="primary" />
                            </div>
                        )}
                        <div style={{height: '60px'}}></div>
                    </IonList>
                )}
            </IonContent>

            {caseStarted && (
                <IonFooter className="ion-no-border" style={{background: '#fff', borderTop: '1px solid #eee'}}>
                    <IonToolbar style={{'--background': '#ffffff', padding: '5px'}}>

                        {/* DIAGNOSIS BUTTON */}
                        <IonButton
                            slot="start"
                            fill="outline"
                            color="secondary"
                            shape="round"
                            onClick={() => setShowModal(true)}
                            disabled={isLoading || isSubmitting}
                            style={{height: '40px', fontSize: '12px', fontWeight: 'bold', marginLeft: '5px'}}
                        >
                            <IonIcon icon={clipboard} slot="start" />
                            DIAGNOSIS
                        </IonButton>

                        {/* INPUT */}
                        <IonInput
                            value={input}
                            placeholder="Ask..."
                            onIonChange={e => setInput(e.detail.value!)}
                            onKeyPress={e => e.key === 'Enter' && handleSend()}
                            disabled={isLoading}
                            style={{
                                background: '#f5f5f5',
                                borderRadius: '20px',
                                paddingLeft: '15px',
                                marginLeft: '5px',
                                marginRight: '5px',
                                height: '40px'
                            }}
                        />

                        {/* SEND BUTTON */}
                        <IonButton slot="end" onClick={handleSend} disabled={!input.trim() || isLoading} fill="clear">
                            <IonIcon icon={send}/>
                        </IonButton>
                    </IonToolbar>
                </IonFooter>
            )}

            {/* --- DIAGNOSIS MODAL --- */}
            <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)} className="blur-modal">
                <IonContent className="ion-padding">
                    <IonHeader collapse="condense">
                        <IonToolbar>
                            <IonTitle size="large">Diagnosis</IonTitle>
                        </IonToolbar>
                    </IonHeader>

                    <div style={{marginTop: '20px', display: 'flex', flexDirection: 'column', height: '80%', justifyContent: 'center'}}>
                        <IonLabel style={{marginBottom: '10px', fontSize: '1.1em'}}>What is your final diagnosis?</IonLabel>

                        <IonCard style={{margin: 0, border: '1px solid #ddd'}}>
                            <IonTextarea
                                rows={6}
                                value={diagnosis}
                                onIonChange={e => setDiagnosis(e.detail.value!)}
                                placeholder="Enter only the diagnosis ..."
                                style={{padding: '10px'}}
                            />
                        </IonCard>

                        <IonButton
                            expand="block"
                            color="primary"
                            style={{marginTop: '20px'}}
                            onClick={handleSendDiagnosis}
                            disabled={isSubmitting || !diagnosis.trim()}
                        >
                            {isSubmitting ? <IonSpinner name="crescent" /> : "Submit Result"}
                        </IonButton>

                        <IonButton
                            expand="block"
                            fill="clear"
                            color="medium"
                            onClick={() => setShowModal(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </IonButton>
                    </div>
                </IonContent>
            </IonModal>
            {/* --- RESULT POPUP (Feedback) --- */}
            <IonModal
                isOpen={showResultModal}
                onDidDismiss={() => setShowResultModal(false)}
                className="blur-modal"
            >
                <IonContent className="ion-padding">
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        textAlign: 'center'
                    }}>

                        {/* Icon: Green Checkmark or Red Alert */}
                        <IonIcon
                            icon={resultData.correct ? checkmarkCircle : alertCircle}
                            color={resultData.correct ? "success" : "danger"}
                            style={{ fontSize: '64px', marginBottom: '20px' }}
                        />

                        <IonTitle style={{ fontSize: '1.5em', color: resultData.correct ? 'green' : 'red' }}>
                            {resultData.correct ? "Correct Diagnosis!" : "Incorrect"}
                        </IonTitle>

                        <p style={{ marginTop: '20px', fontSize: '1.1em', color: '#555' }}>
                            {resultData.message}
                        </p>

                        <IonButton
                            expand="block"
                            color={resultData.correct ? "success" : "danger"}
                            onClick={handleCloseResult}
                            style={{ marginTop: '30px', width: '100%' }}
                        >
                            Close
                        </IonButton>

                    </div>
                </IonContent>
            </IonModal>
        </IonPage>
    );
};

export default ChatPage;