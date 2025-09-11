import cron from 'node-cron';
import GamificationService from '@/lib/services/GamificationService';
import UserStats from '@/lib/models/UserStats';
import connectDB from '@/lib/mongodb';

class RankingUpdateService {
  private static instance: RankingUpdateService;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): RankingUpdateService {
    if (!RankingUpdateService.instance) {
      RankingUpdateService.instance = new RankingUpdateService();
    }
    return RankingUpdateService.instance;
  }

  /**
   * Inicializa los cron jobs para actualizar rankings
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('RankingUpdateService ya inicializado');
      return;
    }

    try {
      await connectDB();

      // Cron job para ejecutar a medianoche todos los días (00:00)
      cron.schedule('0 0 * * *', async () => {
        console.log('Iniciando actualización automática de rankings...');
        await this.updateAllRankings();
      }, {
        timezone: 'America/Mexico_City' // Ajustar según la zona horaria del motoclub
      });

      // Cron job para reset mensual (primer día del mes a las 00:01)
      cron.schedule('1 0 1 * *', async () => {
        console.log('Iniciando reset mensual de estadísticas...');
        await this.resetMonthlyStats();
      }, {
        timezone: 'America/Mexico_City'
      });

      // Cron job para reset anual (1 de enero a las 00:02)
      cron.schedule('2 0 1 1 *', async () => {
        console.log('Iniciando reset anual de estadísticas...');
        await this.resetYearlyStats();
      }, {
        timezone: 'America/Mexico_City'
      });

      this.isInitialized = true;
      console.log('RankingUpdateService inicializado correctamente');
      
    } catch (error) {
      console.error('Error inicializando RankingUpdateService:', error);
    }
  }

  /**
   * Actualiza todos los rankings de usuarios
   */
  async updateAllRankings(): Promise<void> {
    try {
      await connectDB();
      
      console.log('Actualizando rankings de todos los usuarios...');
      
      // Obtener todos los usuarios ordenados por puntos totales
      const allUsers = await UserStats.find({})
        .sort({ totalPoints: -1 })
        .select('userId totalPoints')
        .lean();

      // Actualizar posición de ranking para cada usuario
      const bulkOps = allUsers.map((user, index) => ({
        updateOne: {
          filter: { userId: user.userId },
          update: { 
            $set: { 
              'ranking.position': index + 1,
              'ranking.totalUsers': allUsers.length,
              'ranking.lastUpdated': new Date()
            }
          }
        }
      }));

      if (bulkOps.length > 0) {
        await UserStats.bulkWrite(bulkOps);
        console.log(`Rankings actualizados para ${allUsers.length} usuarios`);
      }

      // Log de estadísticas generales
      await this.logRankingStats();

    } catch (error) {
      console.error('Error actualizando rankings:', error);
    }
  }

  /**
   * Reset de estadísticas mensuales
   */
  async resetMonthlyStats(): Promise<void> {
    try {
      await connectDB();
      
      console.log('Reseteando estadísticas mensuales...');
      
      await UserStats.updateMany({}, {
        $set: {
          monthlyPoints: 0,
          monthlyEvents: 0,
          'monthlyReset.lastReset': new Date(),
          'monthlyReset.month': new Date().getMonth() + 1,
          'monthlyReset.year': new Date().getFullYear()
        }
      });

      console.log('Estadísticas mensuales reseteadas correctamente');

    } catch (error) {
      console.error('Error reseteando estadísticas mensuales:', error);
    }
  }

  /**
   * Reset de estadísticas anuales
   */
  async resetYearlyStats(): Promise<void> {
    try {
      await connectDB();
      
      console.log('Reseteando estadísticas anuales...');
      
      await UserStats.updateMany({}, {
        $set: {
          yearlyPoints: 0,
          yearlyEvents: 0,
          'yearlyReset.lastReset': new Date(),
          'yearlyReset.year': new Date().getFullYear()
        }
      });

      console.log('Estadísticas anuales reseteadas correctamente');

    } catch (error) {
      console.error('Error reseteando estadísticas anuales:', error);
    }
  }

  /**
   * Actualización manual de rankings (para testing o casos especiales)
   */
  async manualRankingUpdate(): Promise<{ success: boolean; message: string; stats?: any }> {
    try {
      await this.updateAllRankings();
      
      const stats = await this.getRankingStats();
      
      return {
        success: true,
        message: 'Rankings actualizados manualmente',
        stats
      };

    } catch (error) {
      console.error('Error en actualización manual:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene estadísticas generales del ranking
   */
  async getRankingStats(): Promise<any> {
    try {
      await connectDB();

      const totalUsers = await UserStats.countDocuments({});
      const topUser = await UserStats.findOne({}).sort({ totalPoints: -1 });
      const averagePoints = await UserStats.aggregate([
        {
          $group: {
            _id: null,
            avgPoints: { $avg: '$totalPoints' },
            avgLevel: { $avg: '$level' },
            totalEvents: { $sum: '$eventsAttended' }
          }
        }
      ]);

      return {
        totalUsers,
        topUser: topUser ? {
          userId: topUser.userId,
          level: topUser.level,
          totalPoints: topUser.totalPoints,
          eventsAttended: topUser.eventsAttended
        } : null,
        averageStats: averagePoints[0] || {
          avgPoints: 0,
          avgLevel: 0,
          totalEvents: 0
        }
      };

    } catch (error) {
      console.error('Error obteniendo estadísticas de ranking:', error);
      return null;
    }
  }

  /**
   * Log de estadísticas para monitoreo
   */
  private async logRankingStats(): Promise<void> {
    try {
      const stats = await this.getRankingStats();
      
      if (stats) {
        console.log('=== ESTADÍSTICAS DE RANKING ===');
        console.log(`Total de usuarios: ${stats.totalUsers}`);
        console.log(`Usuario líder: ${stats.topUser?.userId || 'N/A'} (${stats.topUser?.totalPoints || 0} puntos)`);
        console.log(`Promedio de puntos: ${Math.round(stats.averageStats.avgPoints)}`);
        console.log(`Promedio de nivel: ${Math.round(stats.averageStats.avgLevel)}`);
        console.log(`Total eventos asistidos: ${stats.averageStats.totalEvents}`);
        console.log('===============================');
      }

    } catch (error) {
      console.error('Error registrando estadísticas:', error);
    }
  }

  /**
   * Detiene todos los cron jobs
   */
  destroy(): void {
    cron.getTasks().forEach((task) => {
      task.destroy();
    });
    this.isInitialized = false;
    console.log('RankingUpdateService detenido');
  }
}

export default RankingUpdateService;