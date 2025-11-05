import {
    IonContent,
    IonPage,
    IonButton,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
} from '@ionic/react'
import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import DentalSimLogo from '../image/NoBackground.png'
import '../theme/SelectionPage.css'

const DIFFICULTIES = ['Ușor', 'Mediu', 'Dificil'] as const
const PATIENT_TYPES = [
    'Copil',
    'Adolescent',
    'Adult',
    'Pensionar',
] as const

const SelectionPage: React.FC = () => {
    const history = useHistory()
    const [difficulty, setDifficulty] = useState<typeof DIFFICULTIES[number] | ''>('')
    const [patientType, setPatientType] = useState<typeof PATIENT_TYPES[number] | ''>('')

    const startChat = () => {
        if (!difficulty || !patientType) return
        history.push(`/chat?difficulty=${encodeURIComponent(difficulty)}&type=${encodeURIComponent(patientType)}`)
    }

    return (
        <IonPage>

            <IonContent fullscreen className="ion-padding">
                <div className="hero-logo-wrap">
                    <img src={DentalSimLogo} alt="DentalSim" className="hero-logo" />
                </div>

                <div className="form-card">
                    <IonItem className="ion-margin-bottom">
                        <IonLabel>Dificultate</IonLabel>
                        <IonSelect
                            value={difficulty}
                            placeholder="Alege dificultatea"
                            interface="popover"
                            onIonChange={(e) => setDifficulty(e.detail.value)}
                        >
                            {DIFFICULTIES.map((d) => (
                                <IonSelectOption key={d} value={d}>
                                    {d}
                                </IonSelectOption>
                            ))}
                        </IonSelect>
                    </IonItem>

                    <IonItem className="ion-margin-bottom">
                        <IonLabel>Tip pacient</IonLabel>
                        <IonSelect
                            value={patientType}
                            placeholder="Alege tipul de pacient"
                            interface="popover"
                            onIonChange={(e) => setPatientType(e.detail.value)}
                        >
                            {PATIENT_TYPES.map((t) => (
                                <IonSelectOption key={t} value={t}>
                                    {t}
                                </IonSelectOption>
                            ))}
                        </IonSelect>
                    </IonItem>

                    <IonButton
                        expand="block"
                        className="ion-margin-top"
                        color="secondary"
                        disabled={!difficulty || !patientType}
                        onClick={startChat}
                    >
                        Începe Conversație
                    </IonButton>
                    <IonButton
                        expand="block"
                        fill="clear"
                        className="ion-margin-top"
                        routerLink="/history"
                    >
                        Vezi istoricul conversațiilor →
                    </IonButton>
                </div>
            </IonContent>
        </IonPage>
    )
}

export default SelectionPage
