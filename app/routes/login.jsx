import { json } from '@remix-run/node'
import { useState } from 'react'
import {
  Form,
  Link,
  useActionData,
  useNavigation,
  useRouteError,
  useSearchParams
} from '@remix-run/react'

import {
  checkUser,
  createUserSession,
  login,
  register
} from '~/utils/session.server'
import HandleError from '~/components/HandleError'

function validateEmail(email) {
  if (typeof email !== 'string' || email.length < 6) {
    return `Email must be at least 6 characters long.`
  }
}

function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 6) {
    return `Password must be at least 6 characters long.`
  }
}

function validateUrl(url) {
  let urls = ['/login', '/profile-generator', '/batch-importer']
  if (urls.includes(url)) {
    return url
  }
  return '/login'
}

const badRequest = data => json(data, { status: 400 })

export const action = async ({ request }) => {
  const form = await request.formData()
  const loginType = form.get('loginType')
  const email = form.get('email')
  const password = form.get('password')
  const redirectTo = validateUrl(form.get('redirectTo') || '/profile-generator')
  if (
    typeof loginType !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    typeof redirectTo !== 'string'
  ) {
    return badRequest({
      formError: `Form not submitted correctly.`
    })
  }

  const fields = { loginType, email, password }
  const fieldErrors = {
    email: validateEmail(email),
    password: validatePassword(password)
  }
  if (Object.values(fieldErrors).some(Boolean))
    return badRequest({ fieldErrors, fields })

  switch (loginType) {
    case 'login': {
      const user = await login(email, password)
      if (!user) {
        return badRequest({
          fields,
          formError: `Email/password combination is incorrect.`
        })
      }
      return createUserSession(user.userEmail, redirectTo)
    }
    case 'register': {
      const userExists = await checkUser(email)
      if (userExists) {
        return badRequest({
          fields,
          formError: `User with email ${email} already exists.`
        })
      }
      const user = await register(email, password)
      if (!user) {
        return badRequest({
          fields,
          formError: `Something went wrong trying to create a new user.`
        })
      }
      if (!user.success) {
        return badRequest({
          fields,
          formError: `Something went wrong trying to create a new user. ${user.error}`
        })
      }
      return createUserSession(user.userEmail, redirectTo)
    }
    default: {
      return badRequest({
        fields,
        formError: `Login type invalid`
      })
    }
  }
}

export default function Login() {
  const actionData = useActionData()
  const [searchParams] = useSearchParams()
  const navigation = useNavigation()
  const [submitType, setSubmitType] = useState('login')

  return (
    <div className="flex flex-col h-screen justify-center items-center">
      <div className="top-0 mx-auto w-full md:w-96 bg-yellow-500 dark:bg-purple-800 shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col dark:text-gray-100">
        <Form method="post">
          <input
            type="hidden"
            name="redirectTo"
            value={searchParams.get('redirectTo') ?? undefined}
          />
          <fieldset className="text-center my-3">
            <label className="mr-3">
              <input
                type="radio"
                className="bg-red-300 dark:bg-gray-600"
                name="loginType"
                value="login"
                defaultChecked={
                  !actionData?.fields?.loginType ||
                  actionData?.fields?.loginType === 'login'
                }
                onClick={() => setSubmitType('login')}
              />{' '}
              Login
            </label>
            <label>
              <input
                type="radio"
                className="bg-red-300 dark:bg-gray-600"
                name="loginType"
                value="register"
                defaultChecked={actionData?.fields?.loginType === 'register'}
                onClick={() => setSubmitType('register')}
              />{' '}
              Register
            </label>
          </fieldset>
          <div className="mb-4">
            <label
              className="block text-gray-800 dark:text-gray-100 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full p-2 mb-4 text-gray-900 dark:text-gray-100 dark:bg-gray-600"
              type="email"
              id="email-input"
              name="email"
              defaultValue={actionData?.fields?.email}
              aria-invalid={Boolean(actionData?.fieldErrors?.email)}
              aria-errormessage={
                actionData?.fieldErrors?.email ? 'email-error' : undefined
              }
              placeholder="Enter your email"
            />
            {actionData?.fieldErrors?.email && navigation.state === 'idle' ? (
              <p
                className="form-validation-error text-red-600 dark:text-red-400 text-sm"
                role="alert"
                id="email-error"
              >
                {actionData.fieldErrors.email}
              </p>
            ) : null}
          </div>
          <div className="mb-2">
            <label
              className="block text-gray-800 dark:text-gray-100 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full p-2 mb-4 text-gray-800 dark:text-gray-100 dark:bg-gray-600"
              type="password"
              id="password-input"
              name="password"
              defaultValue={actionData?.fields?.password}
              aria-invalid={
                Boolean(actionData?.fieldErrors?.password) || undefined
              }
              aria-errormessage={
                actionData?.fieldErrors?.password ? 'password-error' : undefined
              }
              placeholder="Enter your password"
            />
            {actionData?.fieldErrors?.password &&
            navigation.state === 'idle' ? (
              <p
                className="form-validation-error text-red-600 dark:text-red-400 text-sm"
                role="alert"
                id="password-error"
              >
                {actionData.fieldErrors.password}
              </p>
            ) : null}
          </div>
          <div id="form-error-message" className="mb-2">
            {actionData?.formError && navigation.state === 'idle' ? (
              <p
                className="form-validation-error text-red-600 dark:text-red-400 text-sm"
                role="alert"
              >
                {actionData.formError}
              </p>
            ) : null}
          </div>
          <div className="flex items-center justify-center">
            <button
              className="bg-red-500 dark:bg-purple-200 hover:bg-red-400 dark:hover:bg-purple-100 text-white dark:text-gray-800 hover:scale-110 disabled:opacity-75 font-bold py-2 px-4 rounded-full mt-2"
              type="submit"
              disabled={navigation.state !== 'idle'}
            >
              {submitType === 'login'
                ? navigation.state === 'submitting' ||
                  (navigation.state === 'loading' &&
                    navigation.formData?.get('loginType') === 'login')
                  ? 'Logging In...'
                  : 'Login'
                : navigation.state === 'submitting' ||
                  (navigation.state === 'loading' &&
                    navigation.formData?.get('loginType') === 'register')
                ? 'Registering...'
                : 'Register'}
            </button>
          </div>
        </Form>
      </div>
      <div className="links text-center">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
        </ul>
      </div>
    </div>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()
  return HandleError(error)
}
