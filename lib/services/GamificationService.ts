import UserStats, { IUserStats } from '@/lib/models/UserStats';
import User from '@/lib/models/User';
import connectDB from '@/lib/mongodb';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  pointsAwarded: number;
  type: 'event' | 'participation' | 'social' | 'special';
  condition: (stats: IUserStats) => boolean;
}

// Definir logros disponibles
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_event',
    name: 'Primer Evento',
    description: 'Asististe a tu primer evento',
    icon: '🎉',
    pointsAwarded: 50,
    type: 'event',
    condition: (stats) => stats.eventsAttended >= 1
  },
  {
    id: 'event_veteran',
    name: 'Veterano de Eventos',
    description: 'Asististe a 10 eventos',
    icon: '🏆',
    pointsAwarded: 200,
    type: 'event',
    condition: (stats) => stats.eventsAttended >= 10
  },
  {
    id: 'event_legend',
    name: 'Leyenda de Eventos',
    description: 'Asististe a 25 eventos',
    icon: '👑',
    pointsAwarded: 500,
    type: 'event',
    condition: (stats) => stats.eventsAttended >= 25
  },
  {
    id: 'perfect_attendance',
    name: 'Asistencia Perfecta',
    description: 'Asististe a todos los eventos registrados',
    icon: '⭐',
    pointsAwarded: 300,
    type: 'participation',
    condition: (stats) => stats.eventsRegistered > 0 && stats.eventsAttended === stats.eventsRegistered && stats.eventsRegistered >= 5
  },
  {
    id: 'monthly_active',
    name: 'Activo del Mes',
    description: 'Asististe a 3 eventos en un mes',
    icon: '📅',
    pointsAwarded: 150,
    type: 'participation',
    condition: (stats) => stats.monthlyEventsAttended >= 3
  },
  {
    id: 'consistent_member',
    name: 'Miembro Consistente',
    description: 'Mantuviste 80% de asistencia',
    icon: '🎯',
    pointsAwarded: 250,
    type: 'participation',
    condition: (stats) => stats.participationScore >= 80 && stats.eventsRegistered >= 5
  },
  {
    id: 'silver_level',
    name: 'Nivel Plata',
    description: 'Alcanzaste el nivel Plata',
    icon: '🥈',
    pointsAwarded: 100,
    type: 'special',
    condition: (stats) => stats.level === 'plata' || stats.level === 'oro' || stats.level === 'platino' || stats.level === 'diamante'
  },
  {
    id: 'gold_level',
    name: 'Nivel Oro',
    description: 'Alcanzaste el nivel Oro',
    icon: '🥇',
    pointsAwarded: 300,
    type: 'special',
    condition: (stats) => stats.level === 'oro' || stats.level === 'platino' || stats.level === 'diamante'
  },
  {
    id: 'platinum_level',
    name: 'Nivel Platino',
    description: 'Alcanzaste el nivel Platino',
    icon: '💎',
    pointsAwarded: 500,
    type: 'special',
    condition: (stats) => stats.level === 'platino' || stats.level === 'diamante'
  },
  {
    id: 'diamond_level',
    name: 'Nivel Diamante',
    description: 'Alcanzaste el nivel Diamante',
    icon: '💠',
    pointsAwarded: 1000,
    type: 'special',
    condition: (stats) => stats.level === 'diamante'
  }
];

export class GamificationService {
  static async getOrCreateUserStats(userId: string): Promise<IUserStats> {
    await connectDB();
    
    let userStats = await UserStats.findOne({ userId });
    
    if (!userStats) {
      userStats = await UserStats.create({
        userId,
        totalPoints: 0,
        monthlyPoints: 0,
        annualPoints: 0,
        level: 'bronce',
        eventsAttended: 0,
        eventsRegistered: 0,
        monthlyEventsAttended: 0,
        annualEventsAttended: 0,
        currentRank: 0,
        bestRank: 0,
        achievements: [],
        participationScore: 0,
        consistencyScore: 0,
        lastActivityDate: new Date()
      });
    }
    
    return userStats;
  }

  static async updateEventStats(userId: string, action: 'register' | 'attend' | 'cancel'): Promise<void> {
    await connectDB();
    
    const userStats = await this.getOrCreateUserStats(userId);
    
    switch (action) {
      case 'register':
        userStats.eventsRegistered += 1;
        userStats.totalPoints += 10; // Puntos por registrarse
        userStats.monthlyPoints += 10;
        userStats.annualPoints += 10;
        break;
        
      case 'attend':
        userStats.eventsAttended += 1;
        userStats.monthlyEventsAttended += 1;
        userStats.annualEventsAttended += 1;
        userStats.totalPoints += 50; // Puntos por asistir
        userStats.monthlyPoints += 50;
        userStats.annualPoints += 50;
        break;
        
      case 'cancel':
        userStats.eventsCancelled += 1;
        // Penalización por cancelar
        userStats.totalPoints = Math.max(0, userStats.totalPoints - 5);
        userStats.monthlyPoints = Math.max(0, userStats.monthlyPoints - 5);
        userStats.annualPoints = Math.max(0, userStats.annualPoints - 5);
        break;
    }
    
    userStats.lastActivityDate = new Date();
    
    // Verificar y otorgar logros
    await this.checkAndAwardAchievements(userStats);
    
    await userStats.save();
  }

  static async checkAndAwardAchievements(userStats: IUserStats): Promise<void> {
    for (const achievement of ACHIEVEMENTS) {
      // Verificar si ya tiene este logro
      const hasAchievement = userStats.achievements.some(a => a.id === achievement.id);
      
      if (!hasAchievement && achievement.condition(userStats)) {
        userStats.addAchievement(achievement);
      }
    }
  }

  static async calculateRankings(): Promise<void> {
    await connectDB();
    
    // Obtener todos los usuarios ordenados por puntos anuales
    const allStats = await UserStats.find({})
      .sort({ annualPoints: -1, totalPoints: -1 })
      .populate('userId', 'firstName lastName isActive');
    
    // Actualizar rankings
    for (let i = 0; i < allStats.length; i++) {
      const userStats = allStats[i];
      const newRank = i + 1;
      
      // Actualizar ranking actual
      userStats.currentRank = newRank;
      
      // Actualizar mejor ranking si es mejor que el anterior
      if (userStats.bestRank === 0 || newRank < userStats.bestRank) {
        userStats.bestRank = newRank;
      }
      
      userStats.rankingUpdatedAt = new Date();
      await userStats.save();
    }
  }

  static async resetMonthlyStats(): Promise<void> {
    await connectDB();
    
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    await UserStats.updateMany({}, {
      $set: {
        monthlyPoints: 0,
        monthlyEventsAttended: 0,
        monthlyResetDate: nextMonth
      }
    });
  }

  static async resetAnnualStats(): Promise<void> {
    await connectDB();
    
    const now = new Date();
    const nextYear = new Date(now.getFullYear() + 1, 0, 1);
    
    await UserStats.updateMany({}, {
      $set: {
        annualPoints: 0,
        annualEventsAttended: 0,
        annualResetDate: nextYear
      }
    });
  }

  static async getUserRanking(userId: string): Promise<{
    currentRank: number;
    totalUsers: number;
    topPercentile: number;
  }> {
    await connectDB();
    
    const userStats = await this.getOrCreateUserStats(userId);
    const totalUsers = await UserStats.countDocuments();
    
    // Calcular percentil
    const usersAbove = await UserStats.countDocuments({
      $or: [
        { annualPoints: { $gt: userStats.annualPoints } },
        { 
          annualPoints: userStats.annualPoints,
          totalPoints: { $gt: userStats.totalPoints }
        }
      ]
    });
    
    const topPercentile = totalUsers > 0 ? Math.round(((totalUsers - usersAbove) / totalUsers) * 100) : 0;
    
    return {
      currentRank: userStats.currentRank || (usersAbove + 1),
      totalUsers,
      topPercentile
    };
  }

  static async getLeaderboard(limit: number = 10): Promise<any[]> {
    await connectDB();
    
    return await UserStats.find({})
      .sort({ annualPoints: -1, totalPoints: -1 })
      .limit(limit)
      .populate('userId', 'firstName lastName profileImage membershipType')
      .select('annualPoints totalPoints currentRank level achievements');
  }

  static async getUserStatsDetails(userId: string): Promise<any> {
    await connectDB();
    
    const userStats = await this.getOrCreateUserStats(userId);
    const ranking = await this.getUserRanking(userId);
    
    return {
      ...userStats.toObject(),
      ranking,
      pointsForNextLevel: userStats.getPointsForNextLevel(),
      recentAchievements: userStats.achievements
        .sort((a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime())
        .slice(0, 5)
    };
  }
}

export default GamificationService;