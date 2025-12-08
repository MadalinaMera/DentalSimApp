import React, { useState } from 'react';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonAvatar,
    IonModal,
    IonButtons,
    IonSegment,
    IonSegmentButton,
    useIonViewWillEnter,
} from '@ionic/react';
import {
    settingsOutline,
    ribbonOutline,
    statsChartOutline,
    flame,
    trophy,
    medkit,
    checkmarkCircle,
    calendar,
} from 'ionicons/icons';
import {
    getAllBadges,
    Badge,
} from '../services/BadgeService';
import BadgeComponent, { BadgeDetail } from '../components/BadgeComponent';

const ProfileTab: React.FC = () => {
    // State for real user data
    const [userProfile, setUserProfile] = useState<any>(null);
    const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);

    const allBadges = getAllBadges(); // Get generic badge definitions (icons, desc)

    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
    const [showBadgeModal, setShowBadgeModal] = useState(false);
    const [badgeFilter, setBadgeFilter] = useState<string>('all');

    // Fetch Data on Enter
    useIonViewWillEnter(() => {
        fetchProfile();
    });

    const fetchProfile = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch('http://localhost:8000/auth/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setUserProfile(data);

                // Map the "Names" from DB to full "Badge Objects" from Service
                const earned = allBadges.filter(b =>
                    data.earned_badges.includes(b.name) || // Check by name match
                    data.earned_badges.includes(b.id)      // Or ID match (depending on how you saved it)
                ).map(b => ({
                    ...b,
                    earnedAt: new Date() // We don't store exact date in this simple DB model yet, so just mark as earned
                }));

                setEarnedBadges(earned);
            }
        } catch (err) {
            console.error("Error fetching profile:", err);
        }
    };

    const handleBadgeClick = (badge: Badge) => {
        setSelectedBadge(badge);
        setShowBadgeModal(true);
    };

    // Filter Logic
    const filteredBadges = badgeFilter === 'earned'
        ? earnedBadges
        : badgeFilter === 'locked'
            ? allBadges.filter(b => !earnedBadges.find(eb => eb.id === b.id))
            : allBadges.map(b => {
                // If earned, use the earned version (has date), else use locked version
                const isEarned = earnedBadges.find(eb => eb.id === b.id);
                return isEarned ? isEarned : b;
            });

    // Display Helpers
    const username = userProfile?.username || 'Guest';
    const initial = username.charAt(0).toUpperCase();
    const xp = userProfile?.xp || 0;
    const level = Math.floor(xp / 1000) + 1; // Calculate level from Real XP

    return (
        <IonPage>
            <IonHeader className="ion-no-border">
                <IonToolbar className="dentsim-toolbar">
                    <IonTitle className="text-center font-bold text-xl">Profile</IonTitle>
                    <IonButtons slot="end">
                        <IonButton className="text-gray-600">
                            <IonIcon icon={settingsOutline} slot="icon-only" />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen className="dentsim-content">
                {/* Profile Header */}
                <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 pt-6 pb-12 px-4">
                    <div className="flex flex-col items-center">
                        {/* Avatar */}
                        <IonAvatar className="w-24 h-24 ring-4 ring-white/30 shadow-xl mb-4 overflow-hidden">
                            <div className="w-full h-full bg-indigo-400 flex items-center justify-center text-white font-bold text-4xl rounded-full">
                                {initial}
                            </div>
                        </IonAvatar>

                        {/* Name */}
                        <h2 className="text-white text-xl font-bold capitalize">{username}</h2>
                        {/* Role - ori il facem dinamic, ori il scoatem*/}
                        <p className="text-indigo-100 text-sm">Dental Student</p>

                        {/* Level Badge */}
                        <div className="flex items-center gap-2 mt-3 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                            <IonIcon icon={ribbonOutline} className="text-white" />
                            <span className="text-white font-semibold">
                Level {level}
              </span>
                            <span className="text-indigo-200">•</span>
                            <span className="text-indigo-100">
                {xp.toLocaleString()} XP
              </span>
                        </div>
                    </div>
                </div>

                {/* Stats Cards - REAL DATA */}
                <div className="px-4 -mt-6">
                    <div className="bg-white rounded-2xl shadow-lg p-4">
                        <div className="grid grid-cols-4 gap-2">
                            <div className="text-center p-2">
                                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                                    <IonIcon icon={flame} className="text-orange-500 text-xl" />
                                </div>
                                <p className="text-lg font-bold text-gray-800">{userProfile?.streak || 0}</p>
                                <p className="text-xs text-gray-500">Streak</p>
                            </div>

                            <div className="text-center p-2">
                                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                                    <IonIcon icon={checkmarkCircle} className="text-green-500 text-xl" />
                                </div>
                                <p className="text-lg font-bold text-gray-800">
                                    {userProfile?.accuracy || 0}%
                                </p>
                                <p className="text-xs text-gray-500">Accuracy</p>
                            </div>

                            <div className="text-center p-2">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                                    <IonIcon icon={medkit} className="text-blue-500 text-xl" />
                                </div>
                                <p className="text-lg font-bold text-gray-800">
                                    {userProfile?.cases_completed || 0}
                                </p>
                                <p className="text-xs text-gray-500">Cases</p>
                            </div>

                            {/*rank*/}
                            <div className="text-center p-2">
                                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                                    <IonIcon icon={trophy} className="text-purple-500 text-xl" />
                                </div>
                                <p className="text-lg font-bold text-gray-800">
                                    {/* Show Rank if it exists, otherwise '--' */}
                                    #{userProfile?.rank || '--'}
                                </p>
                                <p className="text-xs text-gray-500">Rank</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Stats */}
                <div className="px-4 mt-4">
                    <div className="bg-gray-50 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                    <IonIcon icon={calendar} className="text-amber-600 text-xl" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Last Active</p>
                                    <p className="font-semibold text-gray-800">
                                        {userProfile?.last_active_date || 'Never'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                                    <IonIcon icon={statsChartOutline} className="text-indigo-600 text-xl" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total XP Earned</p>
                                    <p className="font-semibold text-gray-800">
                                        {xp.toLocaleString()} XP
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Badges Section */}
                <div className="px-4 mt-6 pb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800">
                            Badges ({earnedBadges.length}/{allBadges.length})
                        </h3>
                    </div>

                    <IonSegment
                        value={badgeFilter}
                        onIonChange={(e) => setBadgeFilter(e.detail.value as string)}
                        className="badge-segment mb-4"
                    >
                        <IonSegmentButton value="all">
                            <span className="text-sm">All</span>
                        </IonSegmentButton>
                        <IonSegmentButton value="earned">
                            <span className="text-sm">Earned</span>
                        </IonSegmentButton>
                        <IonSegmentButton value="locked">
                            <span className="text-sm">Locked</span>
                        </IonSegmentButton>
                    </IonSegment>

                    <div className="grid grid-cols-3 gap-3">
                        {filteredBadges.map((badge) => (
                            <BadgeComponent
                                key={badge.id}
                                badge={badge} // This badge object now knows if it is earned!
                                size="medium"
                                onClick={handleBadgeClick}
                            />
                        ))}
                    </div>
                </div>

                {/* Badge Detail Modal */}
                <IonModal
                    isOpen={showBadgeModal}
                    onDidDismiss={() => {
                        setShowBadgeModal(false);
                        setSelectedBadge(null);
                    }}
                    className="badge-detail-modal"
                    initialBreakpoint={0.75}
                    breakpoints={[0, 0.5, 0.75, 1]}
                >
                    <IonHeader>
                        <IonToolbar>
                            <IonButtons slot="end">
                                <IonButton onClick={() => setShowBadgeModal(false)}>
                                    Done
                                </IonButton>
                            </IonButtons>
                            <IonTitle>Badge Details</IonTitle>
                        </IonToolbar>
                    </IonHeader>
                    <IonContent>
                        {selectedBadge && (
                            <BadgeDetail
                                badge={selectedBadge}
                                onClose={() => setShowBadgeModal(false)}
                            />
                        )}
                    </IonContent>
                </IonModal>
            </IonContent>
        </IonPage>
    );
};

export default ProfileTab;