import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonToast,
    IonSpinner,
    IonList,
    IonListHeader,
} from '@ionic/react';
import { arrowBack, saveOutline, personCircleOutline, lockClosedOutline } from 'ionicons/icons';
import { API_BASE_URL } from '../config';
const SettingsPage: React.FC = () => {
    const history = useHistory();
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, msg: '', color: 'success' });

    // Profile Form State
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('');

    // Password Form State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // Load initial data
    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`${API_BASE_URL}/auth/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUsername(data.username);
                    setRole(data.role || 'Dental Student');
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchUserData();
    }, []);

    const handleUpdateProfile = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/auth/update-profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ username, role }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update');

            setToast({ show: true, msg: 'Profile updated!', color: 'success' });
            // Update local storage cache
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...storedUser, username, role }));

        } catch (err: any) {
            setToast({ show: true, msg: err.message, color: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to change password');

            setToast({ show: true, msg: 'Password changed!', color: 'success' });
            setCurrentPassword('');
            setNewPassword('');

        } catch (err: any) {
            setToast({ show: true, msg: err.message, color: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <IonPage>
            <IonHeader className="ion-no-border">
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={() => history.goBack()}>
                            <IonIcon icon={arrowBack} />
                        </IonButton>
                    </IonButtons>
                    <IonTitle>Settings</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding bg-gray-50">

                {/* PROFILE SECTION */}
                <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                        <IonIcon icon={personCircleOutline} className="text-indigo-500 text-xl" />
                        <h2 className="font-bold text-gray-700">Public Profile</h2>
                    </div>

                    <IonList lines="none">
                        <IonItem className="rounded-xl bg-gray-50 mb-3">
                            <IonLabel position="stacked" color="medium">Username</IonLabel>
                            <IonInput value={username} onIonInput={e => setUsername(e.detail.value!)} />
                        </IonItem>

                        <IonItem className="rounded-xl bg-gray-50 mb-4">
                            <IonLabel position="stacked" color="medium">Role</IonLabel>
                            <IonSelect value={role} onIonChange={e => setRole(e.detail.value)}>
                                <IonSelectOption value="Dental Student">Dental Student</IonSelectOption>
                                <IonSelectOption value="Resident">Resident</IonSelectOption>
                                <IonSelectOption value="General Dentist">General Dentist</IonSelectOption>
                                <IonSelectOption value="Specialist">Specialist</IonSelectOption>
                                <IonSelectOption value="Professor">Professor</IonSelectOption>
                            </IonSelect>
                        </IonItem>

                        <IonButton expand="block" onClick={handleUpdateProfile} disabled={loading} className="dentsim-primary-button">
                            {loading ? <IonSpinner name="crescent" /> : 'Save Changes'}
                        </IonButton>
                    </IonList>
                </div>

                {/* PASSWORD SECTION */}
                <div className="bg-white rounded-2xl shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                        <IonIcon icon={lockClosedOutline} className="text-red-500 text-xl" />
                        <h2 className="font-bold text-gray-700">Security</h2>
                    </div>

                    <IonList lines="none">
                        <IonItem className="rounded-xl bg-gray-50 mb-3">
                            <IonLabel position="stacked" color="medium">Current Password</IonLabel>
                            <IonInput type="password" value={currentPassword} onIonInput={e => setCurrentPassword(e.detail.value!)} />
                        </IonItem>

                        <IonItem className="rounded-xl bg-gray-50 mb-4">
                            <IonLabel position="stacked" color="medium">New Password</IonLabel>
                            <IonInput type="password" value={newPassword} onIonInput={e => setNewPassword(e.detail.value!)} />
                        </IonItem>

                        <IonButton expand="block" color="medium" fill="outline" onClick={handleChangePassword} disabled={loading}>
                            Update Password
                        </IonButton>
                    </IonList>
                </div>

                <IonToast
                    isOpen={toast.show}
                    onDidDismiss={() => setToast({ ...toast, show: false })}
                    message={toast.msg}
                    duration={2000}
                    color={toast.color}
                    position="top"
                />
            </IonContent>
        </IonPage>
    );
};

export default SettingsPage;