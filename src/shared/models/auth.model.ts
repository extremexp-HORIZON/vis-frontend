export interface LoginCredentials {
  username: string
  password: string
}

export interface CredentialsResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  refresh_expires_in: number
  token_type: string
  id_token: string
  'not-before-policy': number
  session_state: string
  scope: string
}

export interface CredentialsErrorResponse {
  error: string
  error_description: string
  error_code: number
}

export interface UserInfoResponse {
  sub: string
  email_verified: boolean
  name: string
  preferred_username: string
  given_name: string
  locale: 'en'
  family_name: string
  email: string
}
