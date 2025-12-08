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
} from '@ionic/react';
import {
  settingsOutline,
  ribbonOutline,
  statsChartOutline,
  flame,
  trophy,
  medkit,
  time,
  checkmarkCircle,
  calendar,
} from 'ionicons/icons';
import {
  getUserStats,
  getAllBadges,
  getEarnedBadges,
  getUserInitials,
  Badge,
} from '../services/BadgeService';
import BadgeComponent, { BadgeDetail } from '../components/BadgeComponent';

const ProfileTab: React.FC = () => {
  const userStats = getUserStats();
  const allBadges = getAllBadges();
  const earnedBadges = getEarnedBadges();

  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [badgeFilter, setBadgeFilter] = useState<string>('all');

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge);
    setShowBadgeModal(true);
  };

  const filteredBadges =
    badgeFilter === 'earned'
      ? allBadges.filter((b) => b.earnedAt)
      : badgeFilter === 'locked'
      ? allBadges.filter((b) => !b.earnedAt)
      : allBadges;

  const getAvatarColor = (): string => 'bg-gradient-to-br from-indigo-500 to-purple-600';

  // Calculate days since joining
  const daysSinceJoined = Math.floor(
    (new Date().getTime() - userStats.joinedDate.getTime()) / (1000 * 60 * 60 * 24)
  );

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
            <IonAvatar className="w-24 h-24 ring-4 ring-white/30 shadow-xl mb-4">
              <div
                className={`w-full h-full ${getAvatarColor()} flex items-center justify-center text-white font-bold text-2xl`}
              >
                {getUserInitials(userStats.name)}
              </div>
            </IonAvatar>

            {/* Name & Email */}
            <h2 className="text-white text-xl font-bold">{userStats.name}</h2>
            <p className="text-indigo-100 text-sm">{userStats.email}</p>

            {/* Level Badge */}
            <div className="flex items-center gap-2 mt-3 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <IonIcon icon={ribbonOutline} className="text-white" />
              <span className="text-white font-semibold">
                Level {userStats.level}
              </span>
              <span className="text-indigo-200">•</span>
              <span className="text-indigo-100">
                {userStats.totalXP.toLocaleString()} XP
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-4 -mt-6">
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center p-2">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <IonIcon icon={flame} className="text-orange-500 text-xl" />
                </div>
                <p className="text-lg font-bold text-gray-800">{userStats.streak}</p>
                <p className="text-xs text-gray-500">Day Streak</p>
              </div>

              <div className="text-center p-2">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <IonIcon icon={checkmarkCircle} className="text-green-500 text-xl" />
                </div>
                <p className="text-lg font-bold text-gray-800">
                  {userStats.accuracy}%
                </p>
                <p className="text-xs text-gray-500">Accuracy</p>
              </div>

              <div className="text-center p-2">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <IonIcon icon={medkit} className="text-blue-500 text-xl" />
                </div>
                <p className="text-lg font-bold text-gray-800">
                  {userStats.casesCompleted}
                </p>
                <p className="text-xs text-gray-500">Cases</p>
              </div>

              <div className="text-center p-2">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <IonIcon icon={trophy} className="text-purple-500 text-xl" />
                </div>
                <p className="text-lg font-bold text-gray-800">
                  #{userStats.rank}
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
                  <p className="text-sm text-gray-500">Member for</p>
                  <p className="font-semibold text-gray-800">
                    {daysSinceJoined} days
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Best Streak</p>
                <p className="font-semibold text-gray-800 flex items-center justify-end gap-1">
                  <IonIcon icon={flame} className="text-orange-500" />
                  {userStats.longestStreak} days
                </p>
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
                    {userStats.totalXP.toLocaleString()} XP
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Competing with</p>
                <p className="font-semibold text-gray-800">
                  {userStats.totalStudents} students
                </p>
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

          {/* Badge Filter */}
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

          {/* Badges Grid */}
          <div className="grid grid-cols-3 gap-3">
            {filteredBadges.map((badge) => (
              <BadgeComponent
                key={badge.id}
                badge={badge}
                size="medium"
                onClick={handleBadgeClick}
              />
            ))}
          </div>

          {filteredBadges.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">No badges to display</p>
            </div>
          )}
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
