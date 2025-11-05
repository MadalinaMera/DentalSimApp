import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
    IonButton, IonContent, IonFooter, IonHeader, IonIcon, IonInput,
    IonLabel, IonList, IonNote, IonPage, IonTitle, IonToolbar
} from '@ionic/react'
import { arrowBack, send } from 'ionicons/icons'
import { useHistory } from 'react-router-dom'
import { patientScenarios, PatientScenario, Difficulty } from '../data/pacientData'

type Sender = 'student' | 'patient'
interface Message { text: string; sender: Sender }

function normalize(s: string) {
    return s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
}

function pickRandomByDifficulty(difficulty: Difficulty): PatientScenario {
    const pool = patientScenarios.filter(p => p.difficulty === difficulty)
    const list = pool.length ? pool : patientScenarios // fallback dacă nu găsește
    return list[Math.floor(Math.random() * list.length)]
}

const ChatPage: React.FC = () => {
    const history = useHistory()
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [scriptIndex, setScriptIndex] = useState(0)
    const contentRef = useRef<HTMLIonContentElement | null>(null)

    const params = new URLSearchParams(window.location.search)
    const difficulty = (params.get('difficulty') as Difficulty) || 'Mediu'

    const scenario = useMemo(() => pickRandomByDifficulty(difficulty), [difficulty])

    useEffect(() => {
        const firstLines = scenario.script.slice(0, 1).map(text => ({ sender: 'patient' as Sender, text }))
        setMessages(firstLines.length ? firstLines : [
            { sender: 'patient', text: 'Bună ziua.' }
        ])
        setScriptIndex(firstLines.length)
    }, [scenario])

    function generatePatientReply(question: string): string {
        const q = normalize(question)

        for (const key of Object.keys(scenario.symptoms)) {
            const nk = normalize(key)
            if (q.includes(nk)) {
                return scenario.symptoms[key]
            }
        }
        if (scriptIndex < scenario.script.length) {
            const line = scenario.script[scriptIndex]
            setScriptIndex(scriptIndex + 1)
            return line
        }

        if (scenario.difficulty === 'Ușor') {
            return 'Mă deranjează mai ales la rece, dar trece repede.'
        }
        if (scenario.difficulty === 'Mediu') {
            return 'Simptomele persistă de ceva timp; sângerează uneori și e sensibil.'
        }
        return 'Durerea e intensă și constantă, s-a și umflat puțin.'
    }

    function handleSend() {
        const text = input.trim()
        if (!text) return
        const studentMsg: Message = { text, sender: 'student' }
        setMessages(prev => [...prev, studentMsg])
        setInput('')

        const reply = generatePatientReply(text)
        setTimeout(() => {
            setMessages(prev => [...prev, { sender: 'patient', text: reply }])
            contentRef.current?.scrollToBottom(300)
        }, 500)
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="secondary">
                    <IonButton slot="start" onClick={() => history.goBack()}>
                        <IonIcon icon={arrowBack} />
                    </IonButton>
                    <IonTitle>
                        Pacient Virtual
                    </IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent ref={contentRef} fullscreen className="ion-padding">
                <IonList lines="none">
                    {messages.map((m, i) => (
                        <div key={i} className={`ion-text-${m.sender === 'student' ? 'end' : 'start'} ion-margin-vertical`}>
                            <div style={{ maxWidth: '90%', display: 'inline-block' }}>
                                <IonLabel
                                    className="ion-padding ion-text-wrap"
                                    style={{
                                        borderRadius: 15,
                                        display: 'block',
                                        background: m.sender === 'student' ? '#2f66ff' : '#f3f4f6',
                                        color: m.sender === 'student' ? '#fff' : '#000',
                                        border: '1px solid #ddd'
                                    }}
                                >
                                    {m.text}
                                </IonLabel>
                                <IonNote style={{ display: 'block', opacity: .6, marginTop: 4 }}>
                                    {m.sender === 'student' ? 'Tu (student)' : 'Pacient Virtual'}
                                </IonNote>
                            </div>
                        </div>
                    ))}
                </IonList>
            </IonContent>

            <IonFooter>
                <IonToolbar>
                    <IonInput
                        value={input}
                        placeholder="Întrebare către pacient..."
                        onIonChange={e => setInput(e.detail.value!)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                        style={{ border: '1px solid #ccc', borderRadius: 20, margin: 8, padding: '4px 10px' }}
                    />
                    <IonButton slot="end" onClick={handleSend} disabled={!input.trim()}>
                        <IonIcon icon={send} />
                    </IonButton>
                </IonToolbar>
            </IonFooter>
        </IonPage>
    )
}

export default ChatPage
