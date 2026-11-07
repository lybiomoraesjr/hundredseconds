import { Alert, Button, Modal, PasswordInput, Stack, Tabs, Text, TextInput } from '@mantine/core'
import { useState, type FormEvent } from 'react'
import { useAuth } from '../../application/auth/useAuth'
import { errorMessage } from '../i18n/errorMessage'
import { messages } from '../i18n/messages'

type AuthTab = 'login' | 'register'

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const t = messages.auth

/** Same rules as the API, checked before sending to give instant feedback. */
function validate(tab: AuthTab, values: { username: string; email: string; password: string }) {
  const errors: Partial<Record<'username' | 'email' | 'password', string>> = {}
  if (tab === 'register') {
    if (!values.username.trim()) errors.username = t.validation.usernameRequired
    else if (values.username.trim().length > 50) errors.username = t.validation.usernameTooLong
    if (values.password.length < 6) errors.password = t.validation.passwordTooShort
    else if (values.password.length > 72) errors.password = t.validation.passwordTooLong
  }
  if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = t.validation.emailInvalid
  if (tab === 'login' && !values.password) errors.password = t.validation.passwordTooShort
  return errors
}

export function AuthModal({ onClose }: { onClose: () => void }) {
  const { login, register } = useAuth()
  const [tab, setTab] = useState<AuthTab>('login')
  const [values, setValues] = useState({ username: '', email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<ReturnType<typeof validate>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const update = (field: keyof typeof values) => (event: { currentTarget: { value: string } }) => {
    const value = event.currentTarget.value
    setValues((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const errors = validate(tab, values)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    setServerError(null)
    try {
      const credentials = { email: values.email.trim(), password: values.password }
      if (tab === 'login') await login(credentials)
      else await register({ ...credentials, username: values.username.trim() })
      onClose()
    } catch (error) {
      setServerError(errorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal opened onClose={onClose} centered title={<Text fw={700}>{messages.appTitle}</Text>}
      closeButtonProps={{ 'aria-label': messages.leaderboard.close }}>
      <Tabs value={tab} onChange={(value) => {
        setTab((value as AuthTab) ?? 'login')
        setFieldErrors({})
        setServerError(null)
      }}>
        <Tabs.List grow mb="md">
          <Tabs.Tab value="login">{t.login}</Tabs.Tab>
          <Tabs.Tab value="register">{t.register}</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <form onSubmit={handleSubmit} noValidate>
        <Stack gap="sm">
          {serverError && <Alert color="red" role="alert">{serverError}</Alert>}
          {tab === 'register' && (
            <TextInput label={t.username} value={values.username} onChange={update('username')}
              error={fieldErrors.username} autoComplete="nickname" maxLength={50} data-autofocus />
          )}
          <TextInput label={t.email} type="email" value={values.email} onChange={update('email')}
            error={fieldErrors.email} autoComplete="email" data-autofocus={tab === 'login' || undefined} />
          <PasswordInput label={t.password} value={values.password} onChange={update('password')}
            error={fieldErrors.password}
            autoComplete={tab === 'login' ? 'current-password' : 'new-password'} />
          <Button type="submit" loading={submitting} color="green.6" mt="xs">
            {tab === 'login' ? t.submitLogin : t.submitRegister}
          </Button>
          <Text size="xs" c="dimmed" ta="center">{t.guestHint}</Text>
        </Stack>
      </form>
    </Modal>
  )
}
