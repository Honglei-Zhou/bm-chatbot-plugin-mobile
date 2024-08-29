// import $socket from '@/api/socket-instance'
import { messageService } from '@/api/messageService'
import { carSearchService } from '@/api/carSearchService'
import { create_UUID } from '@/api/tools'
import { updateUser, updatePageView } from '@/api/user'
import moment from 'moment-timezone'

const state = {
  version: (process.env.PACKAGE_VERSION) ? process.env.PACKAGE_VERSION : '0.0.1',
  bot: {
    acceptFormat: 'text/image',
    dialogState: '',
    isInterrupting: false,
    isProcessing: false,
    intentName: '',
    message: 'Hi',
    responseCard: null,
    sessionAttributes: {},
    slots: {},
    cId: '',
    authorized: false
  },
  isConnected: false,
  messageList: [],
  newMessagesCount: 0,
  isRUnningEmbedded: false,
  isUiMinimized: false,
  alwaysScrollToBottom: true,
  isChatOpen: false,
  tokens: {},
  newCars: [],
  usedCars: [],
  roomId: '',
  cars: {
    type: 'new',
    data: [],
    options: {}
  },
  page: {
    pageSize: 8,
    pageCount: 1,
    pageCurrent: 1,
    totalCount: 0,
    hasNext: false
  },
  lastMessageTime: '',
  lastSentUid: '',
  showTypingIndicator: '',
  lastMessage: {}
}

// actions
const actions = {
  /** ********************************************************************************
   *
   *  Initialization Actions
   *
   *********************************************************************************/
  initCredentials({ commit, state }, credentials) {
    console.log(credentials)
  },

  getConfigFromParent({ commit, state }) {
    console.log('get config from parent')
  },

  initConfig({ commit, state }, configObj) {
    console.log(configObj)
  },

  initMessageList({ commit, state }) {
    console.log('Init Message List')
  },

  reInitBot({ commit, state }) {
    console.log('Reinit Bot')
  },

  initBot({ commit, state }, credential) {
    commit('updateBotID', credential.key)
    localStorage.key = credential.key
    localStorage.origin = credential.origin
    if (state.lastMessageTime === '') {
      var message = { type: 'text', author: 'support', data: { text: `Hi, this is Henri, how can I help you?` }, suggestions: ['trade in', 'service', 'new car sales', 'used car sales', 'dealer information'] }
      commit('pushMessage', message)
      commit('updateLastMessageTime')
    } else {
      var lastTime = moment.tz(state.lastMessageTime, 'Europe/London')
      var curTime = moment.tz(Date.now(), 'Europe/London')
      var ms = moment(curTime, 'DD/MM/YYYY HH:mm:ss').diff(moment(lastTime, 'DD/MM/YYYY HH:mm:ss'))
      var d = moment.duration(ms)
      var h = Math.floor(d.asHours())
      // var s = Math.floor(d.asHours()) + moment.utc(ms).format("hh:mm:ss");
      if (h >= 8) {
        var initMessage = { type: 'text', author: 'support', data: { text: `Hi, this is Henri, how can I help you?` }, suggestions: ['trade in', 'service', 'new car sales', 'used car sales', 'dealer information'] }
        commit('pushMessage', initMessage)
        commit('updateLastMessageTime')
      } else {
        commit('initLastMessage')
      }
    }
  },

  /** *******************************************************************************
   *
   * Message List Actions
   *
   ********************************************************************************/
  pushMessage({ commit, state }, message) {
    commit('pushMessage', message)
  },

  pushErrorMessage({ commit, state }, text, dialogState = 'Failed') {
    commit('pushMessage', {
      type: 'bot',
      text,
      dialogState
    })
  },

  /** *********************************************************************
   *
   * UI and Parent Communication Actions
   *
   **********************************************************************/

  toggleIsUiMinimized({ dispatch, commit, state }) {
    commit('toggleIsUiMinimized')
    return dispatch(
      'sendMessageToParentWindow',
      { event: 'toggleMinimizeUi' }
    )
  },
  toggleIsLoggedIn({ dispatch, commit, state }) {
    commit('toggleIsLoggedIn')
    return dispatch(
      'sendMessageToParentWindow',
      { event: 'toggleIsLoggedIn' }
    )
  },

  /**
   * sendMessageToParentWindow will either dispatch an event using a CustomEvent to a handler when
   * the lex-web-ui is running as a VUE component on a page or will send a message via postMessage
   * to a parent window if an iFrame is hosting the VUE component on a parent page.
   * isRunningEmbedded === true indicates running withing an iFrame on a parent page
   * isRunningEmbedded === false indicates running as a VUE component directly on a page.
   * @param context
   * @param message
   * @returns {Promise<any>}
   */
  sendMessageToParentWindow({ state }, message) {
    if (!state.isRunningEmbedded) {
      return new Promise((resolve, reject) => {
        try {
          const myEvent = new CustomEvent('fullpagecomponent', { detail: message })
          document.dispatchEvent(myEvent)
          resolve(myEvent)
        } catch (err) {
          reject(err)
        }
      })
    }
    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel()
      messageChannel.port1.onmessage = (evt) => {
        messageChannel.port1.close()
        messageChannel.port2.close()
        if (evt.data.event === 'resolve') {
          resolve(evt.data)
        } else {
          const errorMessage =
            `error in sendMessageToParentWindow: ${evt.data.error}`
          reject(new Error(errorMessage))
        }
      }
      window.parent.postMessage(
        message,
        state.config.ui.parentOrigin,
        [messageChannel.port2]
      )
    })
  },

  sendMessage({ commit, state, dispatch }, message) {
    var uid = create_UUID()
    var new_message = {
      groupId: state.roomId,
      message: message,
      tag: 'customer',
      unread: 0,
      uid: uid
    }
    var curTime = moment.tz(Date.now(), 'Europe/London')
    var localTime = curTime.clone().tz('America/Chicago')
    var sysMessage = { type: 'system', author: 'support', data: { text: 'Sent: ', meta: localTime.format('MMMM Do, h:mm a') }}
    commit('pushMessage', sysMessage)

    commit('pushMessage', message)
    commit('updateLastSentUid', uid)
    this._vm.$socket.emit('customer_message', JSON.stringify(new_message))
    commit('showIndicator')
  },

  sendMetaInfo({ state, dispatch }, md) {
    var deviceDetail = 'mobile'
    if (md.phone()) {
      deviceDetail = md.phone()
    } else if (md.tablet()) {
      deviceDetail = md.tablet()
    } else if (md.mobile()) {
      deviceDetail = md.mobile()
    }
    var message = {
      deviceType: 'mobile',
      deviceDetail: deviceDetail,
      sessionId: state.roomId
    }
    updateUser(message)
    // console.log(message)
    // this._vm.$socket.emit('send_meta', JSON.stringify(message))
  },

  sendPageViewInfo({ state, dispatch }, data) {
    var message = {
      sessionId: state.roomId,
      page: data.data,
      dealerId: state.bot.cId,
      botClicked: data.clicked
    }
    updatePageView(message)
  },

  createLeads({ state, dispatch }, message) {
    // var new_message = {
    //   dealerId: localStorage.key,
    //   customer: message.customer,
    //   email: message.email,
    //   phone: message.phone,
    //   note: message.message
    // }
    this._vm.$socket.emit('create_leads', JSON.stringify(message))
  },

  SOCKET_RECEIVED_MESSAGE({ commit }, message) {
    console.log(message)
  },

  /** ******************************************************
   *
   *Socket Actions
   *
   *******************************************************/
  SOCKET_ON_CONNECTION({ commit }, message) {
    // console.log(message)
    // var roomId = localStorage.roomId
    // if (roomId === undefined) {
    //   roomId = create_UUID()
    //   localStorage.roomId = roomId
    // }
    // this._vm.$socket.emit('join', JSON.stringify({ username: 'user', room: roomId }))
    // commit('updateRoomID', roomId)
    console.log(message)
    if (state.lastMessageTime !== '') {
      var lastTime = moment.tz(state.lastMessageTime, 'Europe/London')
      var curTime = moment.tz(Date.now(), 'Europe/London')
      var ms = moment(curTime, 'DD/MM/YYYY HH:mm:ss').diff(moment(lastTime, 'DD/MM/YYYY HH:mm:ss'))
      var d = moment.duration(ms)
      var h = Math.floor(d.asHours())
      if (h >= 8) {
        commit('clearBot')
      }
    } else {
      commit('clearBot')
    }
    // console.log(message)
    var roomId = state.roomId
    if (roomId === undefined || roomId === '') {
      roomId = create_UUID()
      // localStorage.roomId = roomId
    }
    // console.log(roomId)
    this._vm.$socket.emit('join', JSON.stringify({ username: 'user', room: roomId, from: 'mobile' }))
    commit('updateRoomID', roomId)
  },

  SOCKET_CHAT_MESSAGE({ commit, state }, message) {
    // console.log(message)
    commit('updateLastMessageTime')
    var parsedMessage = JSON.parse(message)
    var received_messages = parsedMessage.message
    var richMessage = false
    var texts = []
    var curTime = moment.tz(Date.now(), 'Europe/London')
    var localTime = curTime.clone().tz('America/Chicago')
    var sysMessage = { type: 'system', author: 'support', data: { text: 'Received: ', meta: localTime.format('MMMM Do, h:mm a') }}
    if (parsedMessage.tag !== 'bot') {
      commit('hideIndicator')
      if (parsedMessage.tag !== 'customer') {
        commit('pushMessage', sysMessage)
        commit('pushMessage', received_messages)
      } else if (state.lastSentUid !== parsedMessage.uid) {
        sysMessage.data.text = 'Sent'
        commit('pushMessage', sysMessage)

        received_messages.author = 'me'
        commit('pushMessage', received_messages)
        commit('showIndicator')
      }
    } else {
      commit('hideIndicator')

      sysMessage.data.text = 'Received'
      commit('pushMessage', sysMessage)

      received_messages.forEach((item, index) => {
        // console.log(item)
        if ('platform' in item && item['platform'].toLowerCase() === 'facebook') {
          if ('quickReplies' in item) {
            // Quick Reply
            var qr_msg = {
              type: 'text',
              author: 'support',
              data: { text: item.quickReplies.title },
              suggestions: item.quickReplies.quickReplies
            }
            commit('pushMessage', qr_msg)
            richMessage = true
            // If quick reply, only one message allowed.
          } else if ('text' in item) {
            if (index === 0) {
              var textMsgs = messageService.getTextMessage(item)
              // console.log(textMsgs)
              textMsgs.forEach((textMsg, index) => {
                commit('pushMessage', textMsg)
              })
              // richMessage = true
            } else {
              texts.push({ text: item, index: index })
            }
          } else if ('payload' in item) {
            var msgType = item.payload.facebook.attachment.payload.template_type
            switch (msgType) {
              case 'list':
                var listMsg = messageService.getPayloadListMessage(item)
                commit('pushMessage', listMsg)
                richMessage = true
                break
              case 'generic':
                var cardMsg = messageService.getPayloadCardMessage(item)
                commit('pushMessage', cardMsg)
                richMessage = true
                break
              case 'button':
                var buttonMsg = messageService.getPayloadButtonMessage(item)
                commit('pushMessage', buttonMsg)
                richMessage = true
                break
              case 'media':
                var videoMsgs = messageService.getPayloadVideoMessage(item)
                videoMsgs.forEach((videoMsg, index) => {
                  commit('pushMessage', videoMsg)
                })
                richMessage = true
                break
              case 'form':
                var formMsg = messageService.getFormMessage(item)
                commit('pushMessage', formMsg)
                richMessage = true
                break
              default:
                break
            }
          } else if ('image' in item) {
            var imageMsg = messageService.getImageMessage(item)
            commit('pushMessage', imageMsg)
            richMessage = true
          }
        } else {
          if ('text' in item) {
            texts.push({ text: item, index: index })
          }
        }
      })
    }

    if (!richMessage) {
      texts.forEach((item, index) => {
        var textMsgs = messageService.getTextMessage(item.text)
        textMsgs.forEach((textMsg, index) => {
          commit('pushMessage', textMsg)
        })
      })
    }
  },

  openChat({ commit, state }) {
    commit('openChat')
  },

  closeChat({ commit }) {
    window.parent.postMessage(JSON.stringify({ key: 'close' }), '*')
    commit('closeChat')
  },

  getAllCars({ commit, state }, pageNum) {
    carSearchService.getAllCars(pageNum, state.page.pageSize).then((resp) => {
      var results = resp.data
      // console.log(results)
      // var newCarInventory = []
      // var usedCarInventory = []
      var inventory = []
      var options = { makes: [], makeOptions: [], models: [], modelOptions: {},
        newMakes: [], newMakeOptions: [], newModels: [], newModelOptions: {},
        oldMakes: [], oldMakeOptions: [], oldModels: [], oldModelOptions: {}
      }
      for (var i = 0; i < results.length; i++) {
        var car = results[i]
        var base_url = 'https://www.dthondachicago.com/inventory/'
        var payload = ''
        // console.log(car)
        if (car.series === undefined || car.series === null) {
          payload = car.new_used.toLowerCase() + '-' + car.year + '-' + car.make.toLowerCase() + '-' + car.model.toLowerCase() + '-' + car.drivetrain_desc.toLowerCase() + '-' + car.body.toLowerCase() + '-' + car.vin.toLowerCase()
        } else {
          payload = car.new_used.toLowerCase() + '-' + car.year + '-' + car.make.toLowerCase() + '-' + car.model.toLowerCase() + '-' + car.series.toLowerCase() + '-' + car.drivetrain_desc.toLowerCase() + '-' + car.body.toLowerCase() + '-' + car.vin.toLowerCase()
        }

        if (options.makes.indexOf(car.make) === -1) {
          options.makes.push(car.make)
          options.makeOptions.push({
            value: car.make,
            label: car.make
          })
          options.models.push(car.model)
          options.modelOptions[car.make] = [{
            value: car.model,
            label: car.model
          }]
        } else {
          if (options.models.indexOf(car.model) === -1) {
            options.models.push(car.model)
            options.modelOptions[car.make].push({
              value: car.model,
              label: car.model
            })
          }
        }

        var inventoryElement = {
          name: car.year + ' ' + car.make + ' ' + car.model + ' ' + car.series + ' ' + car.drivetrain_desc,
          title: 'VIN# ' + car.vin,
          subtitle: 'Stock# ' + car.stock,
          new_used: car.new_used,
          meta: {
            title: 'Price',
            value: '$' + car.price,
            price: car.price,
            make: car.make,
            model: car.model,
            msrp: '$' + car.msrp,
            exterior: car.colour,
            interior: car.interior_color
          },
          image_urls: car.photo_url_list,
          url: null,
          buttons: [
            {
              type: 'url',
              title: 'Select and Send',
              payload: base_url + payload
            }
          ]
        }

        inventory.push(inventoryElement)
        if (car.new_used === 'N') {
          inventoryElement.name = 'NEW ' + inventoryElement.name

          if (options.newMakes.indexOf(car.make) === -1) {
            options.newMakes.push(car.make)
            options.newMakeOptions.push({
              value: car.make,
              label: car.make
            })
            options.newModels.push(car.model)
            options.newModelOptions[car.make] = [{
              value: car.model,
              label: car.model
            }]
          } else {
            if (options.newModels.indexOf(car.model) === -1) {
              options.newModels.push(car.model)
              options.newModelOptions[car.make].push({
                value: car.model,
                label: car.model
              })
            }
          }
          // newCarInventory.push(inventoryElement)
        } else {
          if (options.oldMakes.indexOf(car.make) === -1) {
            options.oldMakes.push(car.make)
            options.oldMakeOptions.push({
              value: car.make,
              label: car.make
            })
            options.oldModels.push(car.model)
            options.oldModelOptions[car.make] = [{
              value: car.model,
              label: car.model
            }]
          } else {
            if (options.oldModels.indexOf(car.model) === -1) {
              options.oldModels.push(car.model)
              options.oldModelOptions[car.make].push({
                value: car.model,
                label: car.model
              })
            }
          }
        }
      }
      commit('updatePagination', { total: resp.total, pageCurrent: pageNum, hasNext: resp.has_next })
      commit('addCars', { type: 'new', data: inventory, options: options })
      // commit('addNewCars', newCarInventory)
      // commit('addUsedCars', usedCarInventory)
    })
  },

  getNewCars({ commit, state, dispatch }, pageNum) {
    console.log('Search Cars')
    carSearchService.getNewCars(pageNum, state.page.pageSize).then((resp) => {
      var results = resp.data
      var inventory = []
      var options = { makes: [], makeOptions: [], models: [], modelOptions: {}}
      for (var i = 0; i < results.length; i++) {
        var car = results[i]
        var base_url = 'https://www.dthondachicago.com/inventory/'
        var payload = ''
        if (car.series === undefined) {
          payload = car.new_used.toLowerCase() + '-' + car.year + '-' + car.make.toLowerCase() + '-' + car.model.toLowerCase() + '-' + car.drivetrain_desc.toLowerCase() + '-' + car.body.toLowerCase() + '-' + car.vin.toLowerCase()
        } else {
          payload = car.new_used.toLowerCase() + '-' + car.year + '-' + car.make.toLowerCase() + '-' + car.model.toLowerCase() + '-' + car.series.toLowerCase() + '-' + car.drivetrain_desc.toLowerCase() + '-' + car.body.toLowerCase() + '-' + car.vin.toLowerCase()
        }

        if (options.makes.indexOf(car.make) === -1) {
          options.makes.push(car.make)
          options.makeOptions.push({
            value: car.make,
            label: car.make
          })
          options.models.push(car.model)
          options.modelOptions[car.make] = [{
            value: car.model,
            label: car.model
          }]
        } else {
          if (options.models.indexOf(car.model) === -1) {
            options.models.push(car.model)
            options.modelOptions[car.make].push({
              value: car.model,
              label: car.model
            })
          }
        }

        var inventoryElement = {
          name: 'NEW ' + car.year + ' ' + car.make + ' ' + car.model + ' ' + car.series + ' ' + car.drivetrain_desc,
          title: 'VIN# ' + car.vin,
          subtitle: 'Stock# ' + car.stock,
          new_used: car.new_used,
          meta: {
            title: 'Price',
            value: '$' + car.price,
            msrp: '$' + car.msrp,
            price: car.price,
            make: car.make,
            model: car.model,
            exterior: car.colour,
            interior: car.interior_color
          },
          image_urls: car.photo_url_list,
          url: null,
          buttons: [
            {
              type: 'url',
              title: 'Select and Send',
              payload: base_url + payload
            }
          ]
        }

        inventory.push(inventoryElement)
      }
      commit('updatePagination', { total: resp.total, pageCurrent: pageNum, hasNext: resp.has_next })
      commit('addCars', { type: 'new', data: inventory, options: options })
    })
  },

  getUsedCars({ commit, state }, pageNum) {
    carSearchService.getUsedCars(pageNum, state.page.pageSize).then((resp) => {
      var results = resp.data
      var inventory = []
      var options = { makes: [], makeOptions: [], models: [], modelOptions: {}}
      for (var i = 0; i < results.length; i++) {
        var car = results[i]
        var base_url = 'https://www.dthondachicago.com/inventory/'
        var payload = ''
        if (car.series === undefined) {
          payload = car.new_used.toLowerCase() + '-' + car.year + '-' + car.make.toLowerCase() + '-' + car.model.toLowerCase() + '-' + car.drivetrain_desc.toLowerCase() + '-' + car.body.toLowerCase() + '-' + car.vin.toLowerCase()
        } else {
          payload = car.new_used.toLowerCase() + '-' + car.year + '-' + car.make.toLowerCase() + '-' + car.model.toLowerCase() + '-' + car.series.toLowerCase() + '-' + car.drivetrain_desc.toLowerCase() + '-' + car.body.toLowerCase() + '-' + car.vin.toLowerCase()
        }

        if (options.makes.indexOf(car.make) === -1) {
          options.makes.push(car.make)
          options.makeOptions.push({
            value: car.make,
            label: car.make
          })
          options.models.push(car.model)
          options.modelOptions[car.make] = [{
            value: car.model,
            label: car.model
          }]
        } else {
          if (options.models.indexOf(car.model) === -1) {
            options.models.push(car.model)
            options.modelOptions[car.make].push({
              value: car.model,
              label: car.model
            })
          }
        }

        var inventoryElement = {
          name: car.year + ' ' + car.make + ' ' + car.model + ' ' + car.series + ' ' + car.drivetrain_desc,
          title: 'VIN# ' + car.vin,
          subtitle: 'Stock# ' + car.stock,
          new_used: car.new_used,
          meta: {
            title: 'Price',
            value: '$' + car.price,
            msrp: '$' + car.msrp,
            price: car.price,
            make: car.make,
            model: car.model,
            exterior: car.colour,
            interior: car.interior_color
          },
          image_urls: car.photo_url_list,
          url: null,
          buttons: [
            {
              type: 'url',
              title: 'Select and Send',
              payload: base_url + payload
            }
          ]
        }
        inventory.push(inventoryElement)
      }
      commit('updatePagination', { total: resp.total, pageCurrent: pageNum, hasNext: resp.has_next })
      commit('addCars', { type: 'used', data: inventory, options: options })
    })
  }
}

// mutations
const mutations = {
  /**
  * used to track the expand/minimize status of the window when
  * running embedded in an iframe
  */
  toggleIsUiMinimized(state) {
    state.isUiMinimized = !state.isUiMinimized
  },

  /**
   * Update tokens from cognito authentication
   * @param state
   * @param tokens
   */
  setTokens(state, tokens) {
    if (tokens) {
      state.tokens.idtokenjwt = tokens.idtokenjwt
      state.tokens.accesstokenjwt = tokens.accesstokenjwt
      state.tokens.refreshtoken = tokens.refreshtoken
      state.lex.sessionAttributes.idtokenjwt = tokens.idtokenjwt
      state.lex.sessionAttributes.accesstokenjwt = tokens.accesstokenjwt
      state.lex.sessionAttributes.refreshtoken = tokens.refreshtoken
    } else {
      state.tokens = undefined
    }
  },

  /**
   * Push new message into messages array
   */
  pushMessage(state, message) {
    state.messageList.push(message)
    // state.newMessagesCount += 1
    // if (message.author !== 'me' && message.type !== 'system') {
    //   state.lastMessage = message
    //   window.parent.postMessage(JSON.stringify({ key: 'newMessage', value: 1 }), '*')
    // }
    if (message.author !== 'me' && message.type !== 'system') {
      state.lastMessage = message
      if (state.isChatOpen) {
        state.newMessagesCount = 0
      } else {
        state.newMessagesCount += 1
      }
      // console.log(state.newMessagesCount)
      window.parent.postMessage(JSON.stringify({ key: 'newMessage', value: state.newMessagesCount }), '*')
    }
  },

  openChat(state) {
    state.isChatOpen = true
    state.newMessagesCount = 0
  },

  closeChat(state) {
    state.newMessagesCount = 0
  },

  addNewCars(state, cars) {
    cars.forEach((car) => {
      state.newCars.push(car)
    })
  },

  addUsedCars(state, cars) {
    cars.forEach((car) => {
      state.usedCars.push(car)
    })
  },
  addCars(state, cars) {
    state.cars = cars
  },
  updatePagination(state, data) {
    state.page.totalCount = data.total
    state.page.pageCount = Math.floor(data.total / state.page.pageSize) + 1
    state.page.hasNext = data.hasNext
    state.page.pageCurrent = data.pageCurrent
  },
  updateRoomID(state, roomId) {
    state.roomId = roomId
  },
  updateLastMessageTime(state) {
    state.lastMessageTime = Date.now()
  },
  resetMessageList(state) {
    state.messageList = []
  },
  updateLastSentUid(state, uid) {
    state.lastSentUid = uid
  },
  showIndicator(state) {
    state.showTypingIndicator = 'bot'
  },
  hideIndicator(state) {
    state.showTypingIndicator = ''
  },
  initLastMessage(state) {
    state.lastMessage = { type: 'text', author: 'support', data: { text: `Hi, this is Henri, how can I help you?` }, suggestions: ['trade in', 'service', 'new car sales', 'used car sales', 'dealer information'] }
  },
  clearBot(state) {
    state.messageList = []
    state.newMessagesCount = 0
    state.lastMessage = {}
    state.lastMessageTime = ''
  },
  updateBotID(state, key) {
    state.bot.cId = key
  }
}

export const bmbot = {
  namespaced: true,
  state,
  //   getters,
  actions,
  mutations
}
