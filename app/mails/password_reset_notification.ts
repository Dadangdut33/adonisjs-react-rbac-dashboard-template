import User from '#models/user'
import env from '#start/env'

import { BaseMail } from '@adonisjs/mail'
import { route } from '@izzyjs/route/client'

import { head } from './_shared.js'

export default class PasswordResetNotification extends BaseMail {
  constructor(
    private user: User,
    private token: string
  ) {
    super()
  }

  from = env.get('SMTP_FROM')
  supportEmail = env.get('SUPPORT_EMAIL')
  subject = `Reset Your Password - ${env.get('VITE_APP_NAME') ?? 'My Website'}`

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    const resetLink = `${env.get('APP_URL')}${route('auth.resetPassword', { params: { token: this.token } }).path}`

    this.message.to(this.user.email).html(`
      <html>
        ${head}
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi ${this.user.full_name},</p>
              <p>We received a request to reset your password. If you made this request, you can reset your password by clicking the button below:</p>
              <a href="${resetLink}" class="button">Reset Your Password</a>
              <p>If you didn't request a password reset, please ignore this email.</p>
              <p>If you believe that your account is under attack or compromised, please contact our support team at <a href="mailto:${this.supportEmail}">${this.supportEmail}</a>.</p>
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
