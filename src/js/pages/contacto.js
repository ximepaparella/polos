import { initLayout } from '../init-layout.js'
import { suscribir } from '../supabase-client.js'

initLayout()

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

initPoloTabs()
