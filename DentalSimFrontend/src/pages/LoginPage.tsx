import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
    IonPage,
    IonContent,
    IonButton,
    IonInput,
    IonIcon,
    IonSpinner,
    IonText,
    IonToast,
} from '@ionic/react';
import { mailOutline, lockClosedOutline, logoGoogle, logoApple } from 'ionicons/icons';

import logoImg from '../assets/NoBackground.png';

const LoginPage: React.FC = () => {
    const history = useHistory();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showToast, setShowToast] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please enter both username/email and password.');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8000/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: email,
                    password: password
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            setShowToast(true);

            setTimeout(() => {
                history.replace('/tabs/home');
            }, 500);

        } catch (err: any) {
            setError(err.message || 'Unable to connect to server');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = (provider: string) => {
        console.log(`Login with ${provider}`);
        history.replace('/tabs/home');
    };

    return (
        <IonPage>
            <IonContent fullscreen className="login-content">
                <div className="flex flex-col justify-center px-6 py-12">

                    {/* Logo & Title */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 overflow-hidden">
                            <img
                                src={logoImg}
                                alt="DentSim Logo"
                                className="w-16 h-16 object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    (e.target as HTMLImageElement).parentElement!.innerHTML =
                                        '<span class="text-5xl">🦷</span>';
                                }}
                            />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">DentSim</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Master dental diagnosis through AI-powered practice
                        </p>
                    </div>

                    {/* Login Form */}
                    <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
                        <div className="space-y-4">

                            <div className="login-input-group">
                                <div className="flex items-center bg-gray-100 rounded-2xl px-4 py-1">
                                    <IonIcon
                                        icon={mailOutline}
                                        className="text-gray-400 text-xl mr-3"
                                    />
                                    <IonInput
                                        type="text"
                                        placeholder="Username or Email"
                                        value={email}
                                        onIonInput={(e) => setEmail(e.detail.value || '')}
                                        className="login-input"
                                    />
                                </div>
                            </div>

                            <div className="login-input-group">
                                <div className="flex items-center bg-gray-100 rounded-2xl px-4 py-1">
                                    <IonIcon
                                        icon={lockClosedOutline}
                                        className="text-gray-400 text-xl mr-3"
                                    />
                                    <IonInput
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onIonInput={(e) => setPassword(e.detail.value || '')}
                                        className="login-input"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="text-center">
                                    <IonText color="danger" className="text-sm font-medium">
                                        {error}
                                    </IonText>
                                </div>
                            )}

                            <IonButton
                                expand="block"
                                className="login-button mt-4"
                                onClick={handleLogin}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <IonSpinner name="crescent" className="mr-2" />
                                ) : null}
                                {isLoading ? 'Signing in...' : 'Sign In'}
                            </IonButton>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-gray-400 text-sm">or continue with</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* Social Buttons */}
                    <div className="flex gap-4 mb-8">
                        <IonButton
                            expand="block"
                            fill="outline"
                            className="social-login-button flex-1"
                            onClick={() => handleSocialLogin('google')}
                        >
                            <IonIcon icon={logoGoogle} slot="start" />
                            Google
                        </IonButton>
                        <IonButton
                            expand="block"
                            fill="outline"
                            className="social-login-button flex-1"
                            onClick={() => handleSocialLogin('apple')}
                        >
                            <IonIcon icon={logoApple} slot="start" />
                            Apple
                        </IonButton>
                    </div>

                    {/* Sign Up Link */}
                    <div className="text-center">
                        <p className="text-gray-500">
                            Don't have an account?{' '}
                            <button className="text-indigo-600 font-semibold" onClick={() => history.push('/signup')}>
                                Sign Up
                            </button>
                        </p>
                    </div>

                    {/* Demo Mode */}
                    <div className="mt-8 text-center">
                        <IonButton
                            fill="clear"
                            className="demo-button"
                            onClick={() => history.replace('/tabs/home')}
                        >
                            Continue as Demo User
                        </IonButton>
                    </div>
                </div>

                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message="Welcome back!"
                    duration={1500}
                    color="success"
                    position="top"
                />
            </IonContent>
        </IonPage>
    );
};

export default LoginPage;