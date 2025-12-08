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
import { personOutline, lockClosedOutline, schoolOutline } from 'ionicons/icons';

import logoImg from '../assets/NoBackground.png';

const SignupPage: React.FC = () => {
    const history = useHistory();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [classCode, setClassCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showToast, setShowToast] = useState(false);

    const handleRegister = async () => {
        // 1. Validation
        if (!username || !password) {
            setError('Username and password are required.');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            // 2. Call the Backend Register Endpoint
            const response = await fetch('http://localhost:8000/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    class_code: classCode // Optional, but your backend supports it!
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // 3. Success!
            setShowToast(true);

            // Optional: Auto-login logic could go here, but for now let's redirect to login
            setTimeout(() => {
                history.replace('/login');
            }, 1500);

        } catch (err: any) {
            setError(err.message || 'Unable to connect to server');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <IonPage>
            <IonContent fullscreen className="login-content">
                <div className="h-full flex flex-col justify-center px-6 py-12">
                    {/* Logo Section */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 overflow-hidden">
                            <img
                                src={logoImg}
                                alt="DentSim Logo"
                                className="w-16 h-16 object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-4xl">🦷</span>';
                                }}
                            />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
                        <p className="text-gray-500 text-sm mt-1">Join DentSim today</p>
                    </div>

                    {/* Registration Form */}
                    <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
                        <div className="space-y-4">

                            {/* Username Input */}
                            <div className="login-input-group">
                                <div className="flex items-center bg-gray-100 rounded-2xl px-4 py-1">
                                    <IonIcon icon={personOutline} className="text-gray-400 text-xl mr-3" />
                                    <IonInput
                                        placeholder="Choose a Username"
                                        value={username}
                                        onIonInput={(e) => setUsername(e.detail.value || '')}
                                        className="login-input"
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="login-input-group">
                                <div className="flex items-center bg-gray-100 rounded-2xl px-4 py-1">
                                    <IonIcon icon={lockClosedOutline} className="text-gray-400 text-xl mr-3" />
                                    <IonInput
                                        type="password"
                                        placeholder="Create Password"
                                        value={password}
                                        onIonInput={(e) => setPassword(e.detail.value || '')}
                                        className="login-input"
                                    />
                                </div>
                            </div>

                            {/* Class Code Input (Optional) */}
                            <div className="login-input-group">
                                <div className="flex items-center bg-gray-100 rounded-2xl px-4 py-1">
                                    <IonIcon icon={schoolOutline} className="text-gray-400 text-xl mr-3" />
                                    <IonInput
                                        placeholder="Class Code (Optional)"
                                        value={classCode}
                                        onIonInput={(e) => setClassCode(e.detail.value || '')}
                                        className="login-input"
                                    />
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="text-center">
                                    <IonText color="danger" className="text-sm font-medium">{error}</IonText>
                                </div>
                            )}

                            {/* Register Button */}
                            <IonButton
                                expand="block"
                                className="login-button mt-4"
                                onClick={handleRegister}
                                disabled={isLoading}
                            >
                                {isLoading ? <IonSpinner name="crescent" className="mr-2" /> : null}
                                {isLoading ? 'Creating Account...' : 'Sign Up'}
                            </IonButton>
                        </div>
                    </div>

                    {/* Back to Login Link */}
                    <div className="text-center">
                        <p className="text-gray-500">
                            Already have an account?{' '}
                            <button
                                className="text-indigo-600 font-semibold"
                                onClick={() => history.replace('/login')}
                            >
                                Sign In
                            </button>
                        </p>
                    </div>
                </div>

                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message="Account created successfully! Please log in."
                    duration={2000}
                    color="success"
                    position="top"
                />
            </IonContent>
        </IonPage>
    );
};

export default SignupPage;