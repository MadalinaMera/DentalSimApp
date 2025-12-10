import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonContent,
    IonCard,
    IonCardContent,
    IonProgressBar,
    IonButton,
    IonIcon,
    IonSpinner,
    IonRippleEffect,
    IonToast,
    useIonViewWillEnter,
} from '@ionic/react';
import {
    flame,
    flash,
    medkit,
    chevronForward,
    sparkles,
    ribbon,
} from 'ionicons/icons';
// We still keep BadgeService for mock data on things the backend doesn't provide yet (like class lists)
import { getJoinedClasses, getUserStats } from '../services/BadgeService';

import logoImg from '../assets/NoBackground.png';

const HomeTab: React.FC = () => {
    const history = useHistory();
    const [userInfo, setUserInfo] = useState<any>(null);
    const [isLoadingCase, setIsLoadingCase] = useState(false);
    const [error, setError] = useState('');

    // Mock data for UI elements not yet in backend
    const mockClasses = getJoinedClasses();
    const mockStats = getUserStats();

    // Load user data from local storage whenever we enter the view
    // CHANGED: This now fetches fresh data from the server every time you view the tab
    useIonViewWillEnter(() => {
        fetchUserProfile();
    });

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return; // If no token, we can't fetch

            // 1. Ask the backend for the latest stats
            const response = await fetch('http://localhost:8000/auth/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}` // Show our ID card
                }
            });

            if (response.ok) {
                const freshData = await response.json();

                // 2. Update the UI
                setUserInfo(freshData);

                // 3. Update localStorage so it's fresh for other pages too
                localStorage.setItem('user', JSON.stringify(freshData));
            }
        } catch (err) {
            console.error("Failed to refresh user stats:", err);
        }
    };

    const handleStartDiagnosis = async () => {
        setIsLoadingCase(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found. Please log in again.');
            }

            // 1. Call the Backend
            const response = await fetch('http://localhost:8000/chat/start/random', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Send the JWT token!
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to start case');
            }

            // 2. Success! We have a session_id.
            console.log('Case started, Session ID:', data.session_id);

            // 3. Navigate to the Diagnosis Page with the specific Session ID
            history.push(`/diagnosis/${data.session_id}`);

        } catch (err: any) {
            setError(err.message);
            // If token is expired/invalid, might want to redirect to login
            if (err.message.includes('token') || err.message.includes('401')) {
                history.replace('/login');
            }
        } finally {
            setIsLoadingCase(false);
        }
    };

    // Safe fallback for name if userInfo isn't loaded yet
    const displayName = userInfo?.username
        ? userInfo.username.charAt(0).toUpperCase() + userInfo.username.slice(1)
        : 'Doctor';

    // Calculate generic progress for UI visualization
    const xpProgress = userInfo ? (userInfo.xp % 1000) / 1000 : 0.5;

    // Check if the streak is active today
    const todayStr = new Date().toISOString().split('T')[0];
    const isStreakActive = userInfo?.last_active_date === todayStr;

    return (
        <IonPage>
            <IonHeader className="ion-no-border">
                <IonToolbar className="dentsim-toolbar">
                    <div className="flex items-center justify-between px-4 py-2">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <img
                                src={logoImg}
                                alt="DentSim Logo"
                                className="h-10 w-10 rounded-xl object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">DentSim</h1>
                                <p className="text-xs text-gray-500">Dental Training Hub</p>
                            </div>
                        </div>

                        {/* Streak Badge */}
                        <div
                            className={` flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-500
                                ${isStreakActive
                                ? 'bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-200'  // Active: Orange/Amber
                                : 'bg-gray-100 border border-gray-200'                                      // Inactive: Grey
                                }
                            `}
                        >
                            <IonIcon
                                icon={flame}
                                className={`
                                    text-xl transition-colors duration-500
                                    ${isStreakActive ? 'text-orange-500' : 'text-gray-400'}
                                `}
                            />
                            <span
                                className={`
                                    font-bold transition-colors duration-500
                                    ${isStreakActive ? 'text-orange-600' : 'text-gray-500'}
                                `}
                            >
                                {userInfo?.streak || 0}
                            </span>
                        </div>
                    </div>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen className="dentsim-content">
                <div className="px-4 pb-8">
                    {/* Welcome Section */}
                    <div className="mt-4 mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">
                            Welcome back, {displayName}! 👋
                        </h2>
                        <p className="text-gray-500 mt-1">Ready to practice today?</p>
                    </div>

                    {/* Status Card - Real XP from Backend */}
                    <IonCard className="dentsim-card status-card">
                        <IonCardContent className="p-0">
                            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-5 rounded-2xl">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                                            <IonIcon icon={ribbon} className="text-white text-2xl" />
                                        </div>
                                        <div>
                                            <p className="text-emerald-100 text-sm">Current XP</p>
                                            <p className="text-white text-2xl font-bold">
                                                {userInfo?.xp || 0} XP
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* XP Progress Visual */}
                                <div className="bg-white/10 rounded-full p-1">
                                    <IonProgressBar
                                        value={xpProgress}
                                        className="dentsim-progress h-3 rounded-full"
                                    />
                                </div>
                                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-emerald-100">
                    Level {Math.floor((userInfo?.xp || 0) / 1000) + 1}
                  </span>
                                    <span className="text-white font-medium">
                    Next Level
                  </span>
                                </div>
                            </div>
                        </IonCardContent>
                    </IonCard>

                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-3 gap-3 my-5">
                        {/* CASES CARD */}
                        <div className="bg-blue-50 rounded-2xl p-4 text-center">
                            <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                                <IonIcon icon={medkit} className="text-blue-600 text-xl" />
                            </div>
                            <p className="text-2xl font-bold text-blue-700">
                                {/* Use the real number, default to 0 */}
                                {userInfo?.cases_completed || 0}
                            </p>
                            <p className="text-xs text-blue-500">Cases</p>
                        </div>

                        {/* ACCURACY CARD */}
                        <div className="bg-green-50 rounded-2xl p-4 text-center">
                            <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                                <IonIcon icon={flash} className="text-green-600 text-xl" />
                            </div>
                            <p className="text-2xl font-bold text-green-700">
                                {/* Use the real number, default to 0 */}
                                {userInfo?.accuracy || 0}%
                            </p>
                            <p className="text-xs text-green-500">Accuracy</p>
                        </div>

                        {/* BADGES CARD */}
                        <div className="bg-purple-50 rounded-2xl p-4 text-center">
                            <div className="bg-purple-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                                <IonIcon icon={sparkles} className="text-purple-600 text-xl" />
                            </div>
                            <p className="text-2xl font-bold text-purple-700">
                                {userInfo?.earned_badges?.length || 0}
                            </p>
                            <p className="text-xs text-purple-500">Badges</p>
                        </div>
                    </div>

                    {/* Start Diagnosis CTA - CONNECTED TO BACKEND */}
                    <IonCard
                        className="dentsim-card cta-card ion-activatable overflow-hidden"
                        onClick={handleStartDiagnosis}
                        button
                        disabled={isLoadingCase}
                    >
                        <IonRippleEffect />
                        <IonCardContent className="p-0">
                            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-white text-xl font-bold mb-1">
                                            Start Diagnosis
                                        </h3>
                                        <p className="text-indigo-100 text-sm">
                                            Practice with an AI patient case
                                        </p>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                                        {isLoadingCase ? (
                                            <IonSpinner color="light" />
                                        ) : (
                                            <IonIcon icon={medkit} className="text-white text-3xl" />
                                        )}
                                    </div>
                                </div>
                                <IonButton
                                    expand="block"
                                    className="mt-4 dentsim-cta-button"
                                    fill="solid"
                                >
                                    {isLoadingCase ? 'Creating Session...' : 'Begin Case'}
                                    {!isLoadingCase && <IonIcon slot="end" icon={chevronForward} />}
                                </IonButton>
                            </div>
                        </IonCardContent>
                    </IonCard>

                    {/* Joined Classes Section (Mock Data for now) */}
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold text-gray-800">Your Classes</h3>
                            <IonButton fill="clear" size="small" className="text-indigo-600">
                                View All
                            </IonButton>
                        </div>

                        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                            {mockClasses.map((classItem) => (
                                <IonCard
                                    key={classItem.id}
                                    className="dentsim-class-card flex-shrink-0 w-44"
                                    button
                                >
                                    <IonCardContent className="p-4">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                                            style={{ backgroundColor: classItem.color + '20' }}
                                        >
                                            <span className="text-2xl">{classItem.icon}</span>
                                        </div>
                                        <h4 className="font-bold text-gray-800 text-sm truncate">
                                            {classItem.name}
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {classItem.studentsCount} students
                                        </p>
                                    </IonCardContent>
                                </IonCard>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Error Toast */}
                <IonToast
                    isOpen={!!error}
                    onDidDismiss={() => setError('')}
                    message={error}
                    duration={3000}
                    color="danger"
                    position="top"
                />
            </IonContent>
        </IonPage>
    );
};

export default HomeTab;