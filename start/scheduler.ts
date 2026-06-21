import logger from '@adonisjs/core/services/logger'
import db from '@adonisjs/lucid/services/db'
import scheduler from 'adonisjs-scheduler/services/main'

// Where you put your cron / scheduler like code. Example below is for keeping database connection warm.

// ----------------------------------------
// Keep database connection warm/active.
// scheduler
//   .call(async () => {
//     try {
//       await db.rawQuery('SELECT 1')
//       logger.info('DB Pinged!')
//     } catch (error) {
//       logger.error('Failed to ping DB')
//     }
//   })
//   .everyThirtyMinutes()
//   .withoutOverlapping()

// To see if its working or not
// scheduler.command('inspire').everyFiveSeconds()
