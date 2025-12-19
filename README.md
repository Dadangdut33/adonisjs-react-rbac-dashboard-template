# adonisjs-react-rbac

An open-source fullstack application template built with AdonisJS and ReactJS with Role-Based Access Control (RBAC) system.

## Stacks

- AdonisJS
- ReactJS
- TailwindCSS
- Mantine UI
- TypeScript

## Features

- Drive system (Local / S3) (recommended S3 \*i only tested with S3 storage)
- Role-Based Access Control (RBAC) system
- Cloudflare Captcha
- Email verification
- Auth system including:
  - register
  - login
  - logout
  - Password reset
- Media system (see all uploaded media, manage media)
- Permission system (manage permissions to access different parts of the application)
- Role system (manage roles, assign permissions to roles)

## Drive System

It is very recommended to use `s3` as the drive system. You can deploy your own S3 compatible storage using [RustFS](https://github.com/rustfs/rustfs) or you can use provider like cloudflare R2 that give you free storage with generous limits.

## Notes

To make website icon i recommend this 2 websites:

- [https://favicon.io/](https://favicon.io/)
- [https://maskable.app/editor](https://maskable.app/editor)
