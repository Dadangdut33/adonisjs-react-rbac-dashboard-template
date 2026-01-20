/*
|--------------------------------------------------------------------------
| Define HTTP limiters
|--------------------------------------------------------------------------
|
| The "limiter.define" method creates an HTTP middleware to apply rate
| limits on a route or a group of routes. Feel free to define as many
| throttle middleware as needed.
|
*/
import limiter from '@adonisjs/limiter/services/main'

export const reAskEmailVerifThrottle = limiter.define('request_email_verification', () => {
  return limiter
    .allowRequests(10)
    .every('1 minute')
    .blockFor('3 minute')
    .limitExceeded((error) => {
      error.setMessage('Too many requests, please try again later')
    })
})

export const verifEmailThrottle = limiter.define('email_verification', () => {
  return limiter
    .allowRequests(20)
    .every('1 minute')
    .blockFor('3 minute')
    .limitExceeded((error) => {
      error.setMessage('Too many requests, please try again later')
    })
})

export const resetPasswordThrottle = limiter.define('reset_password', () => {
  return limiter
    .allowRequests(10)
    .every('1 minute')
    .blockFor('3 minute')
    .limitExceeded((error) => {
      error.setMessage('Too many requests, please try again later')
    })
})

export const loginThrottle = limiter.define('login', () => {
  return limiter
    .allowRequests(15)
    .every('1 minute')
    .blockFor('30 minute')
    .limitExceeded((error) => {
      error.setMessage('Too many login attempts, please try again later')
    })
})

export const registerThrottle = limiter.define('register', () => {
  return limiter
    .allowRequests(15)
    .every('1 minute')
    .blockFor('15 minute')
    .limitExceeded((error) => {
      error.setMessage('Too many registrations, please try again later')
    })
})

export const randomPasswordThrottle = limiter.define('random_password', () => {
  return limiter
    .allowRequests(25)
    .every('1 minute')
    .blockFor('3 minute')
    .limitExceeded((error) => {
      error.setMessage('Too many requests, please try again later')
    })
})
