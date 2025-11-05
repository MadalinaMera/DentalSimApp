import React from 'react'
import {
    IonPage,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle
} from '@ionic/react'

const HistoryPage: React.FC = () => {
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="light">
                    <IonTitle>Istoric conversații</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen className="ion-padding">
                <p style={{ textAlign: 'center', opacity: 0.6, marginTop: '40px' }}>
                    Nu există conversații salvate momentan.
                </p>
            </IonContent>
        </IonPage>
    )
}

export default HistoryPage
