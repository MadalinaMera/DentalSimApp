import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonAvatar,
  IonLabel,
  IonIcon,
  IonSegment,
  IonSegmentButton
} from '@ionic/react';
import { trophy, flame, medal } from 'ionicons/icons';
import { getLeaderboard, getUserInitials } from '../services/BadgeService';
import { useState } from 'react';

const LeaderboardTab: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState<string>('weekly');
  const leaderboard = getLeaderboard();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
            <IonIcon icon={trophy} className="text-white text-xl" />
          </div>
        );
      case 2:
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center shadow-md">
            <IonIcon icon={medal} className="text-white text-xl" />
          </div>
        );
      case 3:
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-orange-300 to-orange-500 rounded-full flex items-center justify-center shadow-md">
            <IonIcon icon={medal} className="text-white text-xl" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-bold text-lg">{rank}</span>
          </div>
        );
    }
  };

  const getAvatarColor = (name: string): string => {
    const colors = [
      'bg-indigo-500',
      'bg-emerald-500',
      'bg-pink-500',
      'bg-purple-500',
      'bg-blue-500',
      'bg-amber-500',
      'bg-cyan-500',
      'bg-rose-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="dentsim-toolbar">
          <IonTitle className="text-center font-bold text-xl">
            Leaderboard
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="dentsim-content">
        {/* Time Filter Segment */}
        <div className="px-4 pt-4 pb-2">
          <IonSegment
            value={timeFilter}
            onIonChange={(e) => setTimeFilter(e.detail.value as string)}
            className="leaderboard-segment"
          >
            <IonSegmentButton value="daily">
              <span className="text-sm font-medium">Today</span>
            </IonSegmentButton>
            <IonSegmentButton value="weekly">
              <span className="text-sm font-medium">This Week</span>
            </IonSegmentButton>
            <IonSegmentButton value="monthly">
              <span className="text-sm font-medium">This Month</span>
            </IonSegmentButton>
          </IonSegment>
        </div>

        {/* Top 3 Podium */}
        <div className="px-4 py-6">
          <div className="flex items-end justify-center gap-3">
            {/* 2nd Place */}
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <IonAvatar className="w-16 h-16 ring-4 ring-gray-300">
                  <div
                    className={`w-full h-full ${getAvatarColor(
                      leaderboard[1].name
                    )} flex items-center justify-center text-white font-bold text-lg`}
                  >
                    {getUserInitials(leaderboard[1].name)}
                  </div>
                </IonAvatar>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-bold shadow">
                  2
                </div>
              </div>
              <p className="font-semibold text-gray-800 text-sm text-center truncate w-20">
                {leaderboard[1].name.split(' ')[1]}
              </p>
              <p className="text-gray-500 text-xs">
                {leaderboard[1].totalXP.toLocaleString()} XP
              </p>
              <div className="w-16 h-20 bg-gradient-to-b from-gray-200 to-gray-300 rounded-t-lg mt-2" />
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center -mt-6">
              <div className="relative mb-2">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                  <IonIcon icon={trophy} className="text-yellow-500 text-3xl" />
                </div>
                <IonAvatar className="w-20 h-20 ring-4 ring-yellow-400">
                  <div
                    className={`w-full h-full ${getAvatarColor(
                      leaderboard[0].name
                    )} flex items-center justify-center text-white font-bold text-xl`}
                  >
                    {getUserInitials(leaderboard[0].name)}
                  </div>
                </IonAvatar>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow">
                  1
                </div>
              </div>
              <p className="font-bold text-gray-800 text-center truncate w-24">
                {leaderboard[0].name.split(' ')[1]}
              </p>
              <p className="text-amber-600 text-sm font-semibold">
                {leaderboard[0].totalXP.toLocaleString()} XP
              </p>
              <div className="w-20 h-28 bg-gradient-to-b from-yellow-300 to-amber-400 rounded-t-lg mt-2" />
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <IonAvatar className="w-16 h-16 ring-4 ring-orange-300">
                  <div
                    className={`w-full h-full ${getAvatarColor(
                      leaderboard[2].name
                    )} flex items-center justify-center text-white font-bold text-lg`}
                  >
                    {getUserInitials(leaderboard[2].name)}
                  </div>
                </IonAvatar>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center text-white text-xs font-bold shadow">
                  3
                </div>
              </div>
              <p className="font-semibold text-gray-800 text-sm text-center truncate w-20">
                {leaderboard[2].name.split(' ')[1]}
              </p>
              <p className="text-gray-500 text-xs">
                {leaderboard[2].totalXP.toLocaleString()} XP
              </p>
              <div className="w-16 h-14 bg-gradient-to-b from-orange-200 to-orange-300 rounded-t-lg mt-2" />
            </div>
          </div>
        </div>

        {/* Full Leaderboard List */}
        <div className="bg-white rounded-t-3xl pt-4 mt-2 min-h-full">
          <h3 className="px-4 font-bold text-gray-800 mb-2">All Rankings</h3>
          <IonList className="leaderboard-list">
            {leaderboard.map((entry, index) => (
              <IonItem
                key={entry.id}
                className={`leaderboard-item ${
                  entry.isCurrentUser ? 'current-user-item' : ''
                }`}
                lines="none"
              >
                {/* Rank */}
                <div slot="start" className="mr-3">
                  {getRankIcon(entry.rank)}
                </div>

                {/* Avatar */}
                <IonAvatar slot="start" className="w-12 h-12">
                  <div
                    className={`w-full h-full ${getAvatarColor(
                      entry.name
                    )} flex items-center justify-center text-white font-bold`}
                  >
                    {getUserInitials(entry.name)}
                  </div>
                </IonAvatar>

                <IonLabel className="ml-3">
                  <h2
                    className={`font-semibold ${
                      entry.isCurrentUser ? 'text-indigo-600' : 'text-gray-800'
                    }`}
                  >
                    {entry.name}
                    {entry.isCurrentUser && (
                      <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-500">
                      Lvl {entry.level}
                    </span>
                    <span className="flex items-center text-sm text-orange-500">
                      <IonIcon icon={flame} className="mr-1" />
                      {entry.streak}
                    </span>
                  </div>
                </IonLabel>

                <div slot="end" className="text-right">
                  <p className="font-bold text-gray-800">
                    {entry.totalXP.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">XP</p>
                </div>
              </IonItem>
            ))}
          </IonList>

          {/* Your Position Card (if not in top 10) */}
          {/* This would show if user is outside visible rankings */}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LeaderboardTab;
