import User from '#models/user'
import env from '#start/env'

import { BaseMail } from '@adonisjs/mail'
import { route } from '@izzyjs/route/client'

import { head } from './_shared.js'

export default class VerifyEmailNotification extends BaseMail {
  constructor(
    private user: User,
    private token: string
  ) {
    super()
  }

  from = env.get('SMTP_FROM')
  supportEmail = env.get('SUPPORT_EMAIL')
  subject = `Please Verify Your Email - ${env.get('VITE_APP_NAME') ?? 'My Website'}`

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    if (!this.from) throw new Error('SMTP_FROM is not set')

    const verificationLink = `${env.get('APP_URL')}${route('auth.verifyEmail.verify', { params: { token: this.token } }).path}`

    this.message.to(this.user.email).html(`
      <html>
        ${head}
        <body>
          <div class="container">
            <div class="header">
              <h1>Email Verification Request</h1>
            </div>
            <div class="content">
              <p>Hi ${this.user.full_name},</p>
              <p>Thank you for registering with us! To complete your registration, please verify your email address by clicking the button below:</p>
              <a href="${verificationLink}" class="button">Verify Your Email</a>
              <p>If you didn't create an account with us, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>Need help? Contact our support team at <a href="mailto:${this.supportEmail}">${this.supportEmail}</a>.</p>
            </div>
          </div>
        </body>
      </html>
    `)
  }
}
