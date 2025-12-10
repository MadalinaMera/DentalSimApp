import React, { useState, useRef, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonContent,
    IonFooter,
    IonButton,
    IonIcon,
    IonTextarea,
    IonModal,
    IonList,
    IonItem,
    IonLabel,
    IonRadio,
    IonRadioGroup,
    IonButtons,
    IonChip,
    IonAlert,
    IonSpinner,
    IonToast,
} from '@ionic/react';
import {
    arrowBack,
    send,
    medkit,
    time,
    clipboard,
    search,
    pulse,
    eyedrop,
    checkmarkCircle,
    closeCircle,
} from 'ionicons/icons';
import { getDiagnosisOptions } from '../services/BadgeService';
import { API_BASE_URL } from '../config';
interface Message {
    id: string;
    type: 'patient' | 'student' | 'system';
    content: string;
    timestamp: Date;
}

interface RouteParams {
    caseId?: string;
}

const DiagnosisPage: React.FC = () => {
    const history = useHistory();
    const { caseId } = useParams<RouteParams>();
    const contentRef = useRef<HTMLIonContentElement>(null);

    // Timer state
    const [timeRemaining, setTimeRemaining] = useState(300);
    const [isTimerPaused, setIsTimerPaused] = useState(false);

    // Chat state
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'init-1',
            type: 'system',
            content: 'Patient has entered the office. Review the case file and begin.',
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isAITyping, setIsAITyping] = useState(false);
    const [error, setError] = useState('');

    // Modal & Alert state
    const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
    const [selectedDiagnosisId, setSelectedDiagnosisId] = useState<string>('');
    const [showConfirmAlert, setShowConfirmAlert] = useState(false);
    const [showExitAlert, setShowExitAlert] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [isSubmittingDiagnosis, setIsSubmittingDiagnosis] = useState(false);

    // Result state
    const [diagnosisResult, setDiagnosisResult] = useState<{
        correct: boolean;
        xpEarned: number;
        feedback: string;
        correctDiagnosis?: string;
    } | null>(null);

    // Clinician tools state
    const [showToolsMenu, setShowToolsMenu] = useState(false);

    const diagnosisOptions = getDiagnosisOptions();

    // Scroll to bottom on new messages
    useEffect(() => {
        contentRef.current?.scrollToBottom(300);
    }, [messages, isAITyping]);

    // Timer Countdown
    useEffect(() => {
        if (isTimerPaused || timeRemaining <= 0) return;
        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isTimerPaused, timeRemaining]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleTimeUp = () => {
        setIsTimerPaused(true);
        setShowDiagnosisModal(true);
    };

    const handleSendMessage = async () => {
        if (!inputText.trim() || isAITyping) return;

        const userMsgText = inputText.trim();

        const newMessage: Message = {
            id: Date.now().toString(),
            type: 'student',
            content: userMsgText,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputText('');
        setIsAITyping(true);

        try {
            const token = localStorage.getItem('token');
            if (!token || !caseId) throw new Error("Session invalid");

            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    session_id: caseId,
                    message: userMsgText
                })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Failed to send');

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: 'patient',
                content: data.reply,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiMessage]);

        } catch (err: any) {
            console.error(err);
            setError("Could not reach the patient (AI Error)");
        } finally {
            setIsAITyping(false);
        }
    };

    const confirmDiagnosis = async () => {
        setIsTimerPaused(true);
        setIsSubmittingDiagnosis(true);

        try {
            const selectedOption = diagnosisOptions.find(d => d.id === selectedDiagnosisId);
            if (!selectedOption) return;

            const token = localStorage.getItem('token');

            const response = await fetch(`${API_BASE_URL}/chat/diagnose`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    session_id: caseId,
                    diagnosis: selectedOption.name
                })
            });

            const data = await response.json();

            setDiagnosisResult({
                correct: data.correct,
                xpEarned: data.xp_gained,
                feedback: data.message,
                correctDiagnosis: data.correct_diagnosis
            });

            setShowResultModal(true);

        } catch (err) {
            setError("Failed to submit diagnosis");
            setIsTimerPaused(false);
        } finally {
            setIsSubmittingDiagnosis(false);
        }
    };

    const handleToolAction = (tool: string) => {
        setShowToolsMenu(false);
        const toolMessages: Record<string, string> = {
            examine: '[Visual Exam] Slight swelling in lower right quadrant. Gingiva appears inflamed.',
            percussion: '[Percussion Test] Positive response on tooth #30.',
            thermal: '[Thermal Test] Cold test: Lingering pain >30s.',
            xray: '[X-ray] Periapical radiolucency visible at apex of #30.',
        };
        setMessages((prev) => [...prev, {
            id: Date.now().toString(),
            type: 'system',
            content: toolMessages[tool] || 'Test performed.',
            timestamp: new Date(),
        }]);
    };

    const handleExit = () => history.replace('/tabs/home');

    return (
        <IonPage className="diagnosis-page">
            <IonHeader className="ion-no-border" translucent={false}>
                <IonToolbar className="diagnosis-toolbar">
                    <IonButtons slot="start">
                        <IonButton onClick={() => setShowExitAlert(true)} color="medium">
                            <IonIcon icon={arrowBack} slot="icon-only" />
                        </IonButton>
                    </IonButtons>

                    <div className="flex items-center justify-center">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100`}>
                            <IonIcon icon={time} className={timeRemaining < 60 ? "text-red-500" : "text-emerald-600"} />
                            <span className="font-mono font-bold text-lg">{formatTime(timeRemaining)}</span>
                        </div>
                    </div>

                    <IonButtons slot="end">
                        <IonButton onClick={() => setShowDiagnosisModal(true)}>
                            <IonChip className="diagnosis-submit-chip">
                                <IonIcon icon={clipboard} className="mr-1" />
                                Submit
                            </IonChip>
                        </IonButton>
                    </IonButtons>
                </IonToolbar>

                <div className="clinician-toolbar bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-around py-2 px-4">
                        <button onClick={() => handleToolAction('examine')} className="flex flex-col items-center gap-1 p-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"><IonIcon icon={search} className="text-blue-600" /></div>
                            <span className="text-[10px] text-gray-600">Examine</span>
                        </button>
                        <button onClick={() => handleToolAction('percussion')} className="flex flex-col items-center gap-1 p-2">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center"><IonIcon icon={pulse} className="text-orange-600" /></div>
                            <span className="text-[10px] text-gray-600">Tap</span>
                        </button>
                        <button onClick={() => handleToolAction('thermal')} className="flex flex-col items-center gap-1 p-2">
                            <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center"><IonIcon icon={eyedrop} className="text-cyan-600" /></div>
                            <span className="text-[10px] text-gray-600">Cold</span>
                        </button>
                        <button onClick={() => handleToolAction('xray')} className="flex flex-col items-center gap-1 p-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center"><IonIcon icon={medkit} className="text-purple-600" /></div>
                            <span className="text-[10px] text-gray-600">X-Ray</span>
                        </button>
                    </div>
                </div>
            </IonHeader>

            <IonContent ref={contentRef} className="chat-content">
                <div className="flex flex-col p-4 gap-3">
                    {messages.map((message) => (
                        <div key={message.id} className={`flex ${message.type === 'student' ? 'justify-end' : message.type === 'system' ? 'justify-center' : 'justify-start'}`}>
                            {message.type === 'system' ? (
                                <div className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full text-center max-w-[90%]">
                                    {message.content}
                                </div>
                            ) : (
                                <div className={`max-w-[80%] ${message.type === 'student' ? 'chat-bubble-student' : 'chat-bubble-patient'}`}>
                                    {message.type === 'patient' && (
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-blue-600">Patient</span>
                                        </div>
                                    )}
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                </div>
                            )}
                        </div>
                    ))}
                    {isAITyping && (
                        <div className="flex justify-start">
                            <div className="chat-bubble-patient">
                                <div className="typing-indicator"><span></span><span></span><span></span></div>
                            </div>
                        </div>
                    )}
                </div>
            </IonContent>

            <IonFooter className="chat-footer ion-no-border" translucent={false}>
                <div className="flex items-end gap-2 p-3 pb-safe bg-white border-t border-gray-100">
                    <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2">
                        <IonTextarea
                            value={inputText}
                            placeholder="Ask a question..."
                            autoGrow
                            rows={1}
                            enterkeyhint="send"
                            onIonInput={(e) => setInputText(e.detail.value || '')}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            className="chat-input"
                        />
                    </div>
                    <IonButton
                        className="send-button"
                        onClick={handleSendMessage}
                        disabled={!inputText.trim() || isAITyping}
                    >
                        <IonIcon icon={send} slot="icon-only" />
                    </IonButton>
                </div>
            </IonFooter>

            <IonModal isOpen={showDiagnosisModal} onDidDismiss={() => setShowDiagnosisModal(false)} className="diagnosis-modal">
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start"><IonButton onClick={() => setShowDiagnosisModal(false)}>Cancel</IonButton></IonButtons>
                        <IonButtons slot="end">
                            <IonButton strong onClick={() => { setShowDiagnosisModal(false); setShowConfirmAlert(true); }} disabled={!selectedDiagnosisId}>
                                Next
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <div className="p-4">
                        <h2 className="text-xl font-bold mb-4">Select Diagnosis</h2>
                        <IonRadioGroup value={selectedDiagnosisId} onIonChange={(e) => setSelectedDiagnosisId(e.detail.value)}>
                            <IonList>
                                {diagnosisOptions.map((option) => (
                                    <IonItem
                                        key={option.id}
                                        button={true}
                                        detail={false} // <--- FIX: Hides the arrow, keeps the click!
                                        onClick={() => setSelectedDiagnosisId(option.id)}
                                        className="diagnosis-option"
                                    >
                                        <IonLabel>
                                            <h3 className="font-bold">{option.name}</h3>
                                            <p className="text-xs text-gray-500">{option.description}</p>
                                        </IonLabel>
                                        <IonRadio slot="end" value={option.id} />
                                    </IonItem>
                                ))}
                            </IonList>
                        </IonRadioGroup>
                    </div>
                </IonContent>
            </IonModal>

            <IonAlert
                isOpen={showConfirmAlert}
                onDidDismiss={() => setShowConfirmAlert(false)}
                header="Finalize Diagnosis"
                message="Are you sure? You cannot change this later."
                buttons={[
                    { text: 'Cancel', role: 'cancel' },
                    { text: 'Submit', handler: confirmDiagnosis }
                ]}
            />

            <IonAlert
                isOpen={showExitAlert}
                onDidDismiss={() => setShowExitAlert(false)}
                header="Exit Session?"
                message="If you leave now, you won't get any XP, but your accuracy score won't be affected."
                buttons={[
                    { text: 'Stay', role: 'cancel' },
                    { text: 'Leave', role: 'destructive', handler: handleExit },
                ]}
            />

            <IonModal isOpen={showResultModal} backdropDismiss={false} className="result-modal">
                <IonContent>
                    <div className="flex flex-col items-center justify-center min-h-full p-6 text-center">
                        {isSubmittingDiagnosis ? (
                            <IonSpinner name="crescent" />
                        ) : (
                            <>
                                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${diagnosisResult?.correct ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
                                    <IonIcon icon={diagnosisResult?.correct ? checkmarkCircle : closeCircle} className="text-6xl" />
                                </div>

                                <h2 className="text-2xl font-bold mb-2">{diagnosisResult?.correct ? 'Correct Diagnosis!' : 'Incorrect'}</h2>

                                {!diagnosisResult?.correct && (
                                    <p className="text-gray-500 mb-4">Correct was: <span className="font-bold">{diagnosisResult?.correctDiagnosis}</span></p>
                                )}

                                <div className="bg-yellow-50 px-6 py-3 rounded-xl mb-6 border border-yellow-100">
                                    <span className="text-yellow-700 font-bold text-xl">+{diagnosisResult?.xpEarned} XP</span>
                                </div>

                                <p className="text-sm text-gray-600 mb-8 leading-relaxed">{diagnosisResult?.feedback}</p>

                                <IonButton expand="block" onClick={handleExit} className="dentsim-primary-button">
                                    Return to Home
                                </IonButton>
                            </>
                        )}
                    </div>
                </IonContent>
            </IonModal>

            <IonToast isOpen={!!error} onDidDismiss={() => setError('')} message={error} duration={3000} color="danger" />
        </IonPage>
    );
};

export default DiagnosisPage;