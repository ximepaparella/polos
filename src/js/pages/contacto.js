import { initLayout } from '../init-layout.js'
import { isHoneypotTriggered, validateSuscripcionForm } from '../utils/form-validation.js'

initLayout()

const SUCCESS_MESSAGE = '¡Te suscribiste correctamente!'
const ERROR_MESSAGE = 'Error al enviar. Intentá nuevamente.'
const SUBMIT_LABEL = 'Enviar'
const SUBMITTING_LABEL = 'Enviando...'

function initPoloTabs() {
  const list = document.getElementById('contacto-polos-list')

  if (!list) {
    return
  }

  const items = [...list.querySelectorAll('.contacto-polo')]

  items.forEach((item) => {
    item.addEventListener('click', (event) => {
      if (event.target.closest('a')) {
        return
      }

      items.forEach((polo) => {
        polo.classList.remove('contacto-polo--active')
      })

      item.classList.add('contacto-polo--active')
    })

    item.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return
      }

      event.preventDefault()
      item.click()
    })

    item.setAttribute('tabindex', '0')
    item.setAttribute('role', 'button')
  })
}

function setFormMessage(messageEl, ok, message) {
  messageEl.textContent = message
  messageEl.className = ok ? 'form-message--success' : 'form-message--error'
}

async function submitToNetlify(form) {
  const params = new URLSearchParams(new FormData(form))
  params.set('form-name', 'suscripcion')

  const response = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  if (response.ok || response.status === 302) {
    return 'ok'
  }

  if (response.status === 404) {
    return 'fallback-native'
  }

  return 'error'
}

const form = document.getElementById('form-suscripcion')
const submitBtn = document.getElementById('form-submit')
const messageEl = document.getElementById('form-message')

if (messageEl) {
  const sent = new URLSearchParams(window.location.search).get('enviado')

  if (sent === 'ok') {
    setFormMessage(messageEl, true, SUCCESS_MESSAGE)
    window.history.replaceState({}, '', window.location.pathname)
  }
}

if (form && submitBtn && messageEl) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    const honeypot = form.elements['bot-field']?.value ?? ''

    if (isHoneypotTriggered(honeypot)) {
      setFormMessage(messageEl, true, SUCCESS_MESSAGE)
      form.reset()
      return
    }

    const validation = validateSuscripcionForm(
      form.nombre.value,
      form.email.value,
    )

    if (!validation.ok) {
      setFormMessage(messageEl, false, validation.message)
      return
    }

    form.nombre.value = validation.nombre
    form.email.value = validation.email

    submitBtn.disabled = true
    submitBtn.textContent = SUBMITTING_LABEL
    messageEl.className = ''
    messageEl.textContent = ''

    try {
      const result = await submitToNetlify(form)

      if (result === 'ok') {
        setFormMessage(messageEl, true, SUCCESS_MESSAGE)
        form.reset()
      } else if (result === 'fallback-native') {
        HTMLFormElement.prototype.submit.call(form)
        return
      } else {
        setFormMessage(messageEl, false, ERROR_MESSAGE)
      }
    } catch (error) {
      console.error('Error enviando formulario:', error)
      setFormMessage(messageEl, false, ERROR_MESSAGE)
    } finally {
      if (submitBtn.isConnected) {
        submitBtn.disabled = false
        submitBtn.textContent = SUBMIT_LABEL
      }
    }
  })
}

initPoloTabs()
