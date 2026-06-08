import { initLayout } from '../init-layout.js'
import { suscribir } from '../supabase-client.js'

initLayout()

const form = document.getElementById('form-suscripcion')
const submitBtn = document.getElementById('form-submit')
const messageEl = document.getElementById('form-message')

if (form && submitBtn && messageEl) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    submitBtn.disabled = true
    submitBtn.textContent = 'Enviando...'
    messageEl.className = ''
    messageEl.textContent = ''

    const nombre = form.nombre.value
    const email = form.email.value

    const result = await suscribir(nombre, email)

    messageEl.textContent = result.message
    messageEl.className = result.ok ? 'form-message--success' : 'form-message--error'

    if (result.ok) {
      form.reset()
    }

    submitBtn.disabled = false
    submitBtn.textContent = 'Enviar'
  })
}
