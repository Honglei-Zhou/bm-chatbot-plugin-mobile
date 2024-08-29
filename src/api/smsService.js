import axios from 'axios'
import commonConfig from './common'

const baseUrl = commonConfig.baseUrl
const socketUrl = commonConfig.socketUrl

export const smsService = {
  sendProfile,
  sendTextMessage,
  sendSMSMessage
}

// const baseUrl = 'https://fqvrhq3xy0.execute-api.us-east-1.amazonaws.com/v1'
// const baseUrl = 'https://9w7b1r8iy1.execute-api.us-east-1.amazonaws.com/dev'
const timeout = 4000

function sendProfile(cId, origin, email, phone) {
  return new Promise((resolve, reject) => {
    var bodyFormData = new FormData()
    bodyFormData.append('cId', cId)
    bodyFormData.append('origin', origin)
    bodyFormData.append('email', email)
    bodyFormData.append('phone', phone)
    axios({
      url: '/api/leads/new',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: bodyFormData,
      baseURL: baseUrl,
      timeout: timeout
    }).then((resp) => {
      // console.log(resp.data)
      resolve(resp.data)
    }).catch(err => {
      reject(err)
    })
  })
}

function sendTextMessage(cId, origin, name, phone, message) {
  return new Promise((resolve, reject) => {
    var bodyFormData = new FormData()
    bodyFormData.append('cId', cId)
    bodyFormData.append('origin', origin)
    bodyFormData.append('customer', name)
    bodyFormData.append('phone', phone)
    bodyFormData.append('note', message)
    axios({
      url: '/api/leads/new',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: bodyFormData,
      baseURL: baseUrl,
      timeout: timeout
    }).then((resp) => {
      // console.log(resp.data)
      resolve(resp.data)
    }).catch(err => {
      reject(err)
    })
  })
}

function sendSMSMessage(message) {
  return new Promise((resolve, reject) => {
    var bodyFormData = new FormData()
    bodyFormData.append('dealerId', message.dealerId)
    bodyFormData.append('customer', message.customer)
    bodyFormData.append('phone', message.phone)
    bodyFormData.append('email', message.email)
    bodyFormData.append('note', message.note)
    bodyFormData.append('sessionId', message.sessionId)
    axios({
      url: '/api/create_lead',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: bodyFormData,
      baseURL: socketUrl
      // baseURL: 'https://middleware-dev.bmhax.com'
    }).then((resp) => {
      resolve(resp.data)
    }).catch(err => {
      reject(err)
    })
  })
}
