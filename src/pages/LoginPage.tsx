import React, { useState } from 'react'
import { IonPage, IonContent, IonItem, IonLabel, IonInput, IonButton } from '@ionic/react'
import { useHistory } from 'react-router-dom'
import DentalSimLogo from '../image/NoBackground.png'
import '../theme/SelectionPage.css'

const TOKEN_KEY = 'dentalsim_token'
const USER_KEY = 'dentalsim_user'

const LoginPage: React.FC = () => {
    const history = useHistory()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleLogin() {
        setError(null)
        const u = username.trim().toLowerCase()
        const p = password
        if (!u || !p) return
        setLoading(true)
        try {
            const resp = await fetch('http://localhost:8000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: u, password: p })
            })
            const data = await resp.json()
            if (!resp.ok || !data.ok) {
                setError(data.error || 'Autentificare eșuată')
            } else {
                localStorage.setItem(TOKEN_KEY, data.token)
                localStorage.setItem(USER_KEY, data.user?.username || u)
                history.push('/select')
            }
        } catch (err:any) {
            console.error('Eroare la autentificare:', err)
            setError('Nu mă pot conecta la server. Verifică backend-ul.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <IonPage>
            <IonContent fullscreen className="ion-padding">
                {/* Logo mare */}
                <div className="hero-logo-wrap">
                    <img src={DentalSimLogo} alt="DentalSim" className="hero-logo" />
                </div>

                {/* Card formular */}
                <div className="form-card">
                    <IonItem className="ion-margin-bottom">
                        <IonLabel position="stacked">Utilizator</IonLabel>
                        <IonInput
                            value={username}
                            placeholder="Ex: anca"
                            onIonChange={(e) => setUsername(e.detail.value ?? '')}
                            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                        />
                    </IonItem>

                    <IonItem className="ion-margin-bottom">
                        <IonLabel position="stacked">Parolă</IonLabel>
                        <IonInput
                            type="password"
                            value={password}
                            placeholder="Parola"
                            onIonChange={(e) => setPassword(e.detail.value ?? '')}
                            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                        />
                    </IonItem>

                    {error && <p style={{ color: 'crimson', marginTop: 8 }}>{error}</p>}

                    <IonButton
                        expand="block"
                        color="secondary"
                        className="ion-margin-top"
                        disabled={!username.trim() || !password || loading}
                        onClick={handleLogin}
                    >
                        {loading ? 'Autentificare...' : 'Autentifică-te'}
                    </IonButton>
                </div>
            </IonContent>
        </IonPage>
    )
}

export default LoginPage
