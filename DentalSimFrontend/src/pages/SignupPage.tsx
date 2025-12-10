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
    IonSelect,          // <--- Import Select
    IonSelectOption,    // <--- Import Option
    IonItem,            // <--- Needed for Select layout
    IonLabel,
} from '@ionic/react';
import { personOutline, lockClosedOutline, schoolOutline, medkitOutline } from 'ionicons/icons';

import logoImg from '../assets/NoBackground.png';
import { API_BASE_URL } from '../config';

const SignupPage: React.FC = () => {
    const history = useHistory();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Dental Student'); // <--- Default Role
    const [classCode, setClassCode] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showToast, setShowToast] = useState(false);

    const handleRegister = async () => {
        if (!username || !password) {
            setError('Username and password are required.');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    password,
                    role,       // <--- Send the selected role
                    class_code: classCode
                }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Registration failed');

            setShowToast(true);
            setTimeout(() => history.replace('/login'), 1500);

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
                                }}
                            />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
                        <p className="text-gray-500 text-sm mt-1">Join DentSim today</p>
                    </div>

                    <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
                        <div className="space-y-4">

                            {/* Username */}
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

                            {/* Password */}
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

                            {/* --- NEW: ROLE SELECTOR --- */}
                            <div className="login-input-group">
                                <div className="flex items-center bg-gray-100 rounded-2xl px-4 py-1">
                                    <IonIcon icon={medkitOutline} className="text-gray-400 text-xl mr-3" />
                                    <div className="w-full">
                                        {/* Native Select for cleaner mobile feel in this context */}
                                        <IonSelect
                                            value={role}
                                            onIonChange={(e) => setRole(e.detail.value)}
                                            interface="popover"
                                            className="w-full text-gray-700"
                                            style={{ paddingLeft: 0 }} // Align text with other inputs
                                        >
                                            <IonSelectOption value="Dental Student">Dental Student</IonSelectOption>
                                            <IonSelectOption value="Resident">Resident</IonSelectOption>
                                            <IonSelectOption value="General Dentist">General Dentist</IonSelectOption>
                                            <IonSelectOption value="Professor">Professor</IonSelectOption>
                                        </IonSelect>
                                    </div>
                                </div>
                            </div>

                            {/* Class Code */}
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