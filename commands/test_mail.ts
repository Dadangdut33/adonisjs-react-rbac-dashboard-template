import env from '#start/env'

import { BaseCommand, args } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import mail from '@adonisjs/mail/services/main'

export default class TestMail extends BaseCommand {
  static commandName = 'mail:test'
  static description = 'Send a test email'

  static options: CommandOptions = {
    startApp: true,
  }

  @args.string()
  declare destination: string

  async run() {
    console.log(this.destination)
    this.logger.info('Sending test email...')
    const mailFrom = env.get('SMTP_FROM')
    if (!mailFrom) {
      this.logger.error('SMTP_FROM is not set')
      return
    }
    if (!this.destination) {
      this.logger.error('Destination email is required')
      return
    }

    // must be a valid email
    if (!this.destination.includes('@')) {
      this.logger.error('Invalid email')
      return
    }

    try {
      await mail.use('smtp').send((message) => {
        message
          .to(this.destination)
          .from(mailFrom)
          .subject('SMTP Test')
          .text('This is a test email to check SMTP configuration.')
      })
      this.logger.info('Test email sent successfully!')
    } catch (error) {
      this.logger.error('Failed to send test email:')
      this.logger.error(error)
    }
  }
}
