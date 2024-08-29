import './bmbot.less'

const toChatBtn = document.createElement('div')
toChatBtn.setAttribute('id', 'bmbot-pane-btn')

const chatIcon = document.createElement('div')
chatIcon.setAttribute('class', 'bm-icon icon-talk')
// chatIcon.setAttribute('class', 'icon-talk')

const messageCount = document.createElement('div')
messageCount.setAttribute('class', 'sc-new-messsages-count')
messageCount.innerText = 0

toChatBtn.appendChild(chatIcon)
toChatBtn.appendChild(messageCount)

const toChatPane = document.createElement('div')
toChatPane.setAttribute('id', 'bmbot-pane-chat')

const endpointUrl = 'http://localhost:9901/bmchat/'
const mobileUrl = 'http://localhost:9901/bmchat/'
// let endpointUrl = 'https://blissmotors-chatbot-plugin.s3.amazonaws.com/views/bmchat/index.html#/'
// let mobileUrl = 'https://blissmotors-chatbot-plugin-mobile.s3.amazonaws.com/mobileviews/bmchat/index.html#/'

const clientWidth = document.documentElement.getBoundingClientRect().width
let mobileSrc = mobileUrl
let pcSrc = endpointUrl

if (process.env.NODE_ENV === 'production') {
  mobileSrc = mobileUrl
  pcSrc = endpointUrl
}

let innerText = `<iframe id="iframe" src="${mobileSrc}" frameborder="0" allowtransparency="no" scrolling="no"></iframe>`

toChatPane.setAttribute('class', 'mobile')
toChatBtn.setAttribute('class', 'mobile')

// Suppose > 640 as PC
if (clientWidth > 980) {
  innerText = `<iframe id="iframe" src="${pcSrc}" frameborder="0" allowtransparency="no" scrolling="no"></iframe>`
  toChatPane.setAttribute('class', 'pc')
  toChatBtn.setAttribute('class', 'pc')
}
toChatPane.innerHTML = innerText
document.body.appendChild(toChatBtn)
document.body.appendChild(toChatPane)

const iframe = document.getElementById('iframe')

const togglePane = function() {
  toChatPane.style.display = getComputedStyle(toChatPane).display === 'block' ? 'none' : 'block'
  toChatBtn.style.display = getComputedStyle(toChatBtn).display === 'block' ? 'none' : 'block'
}

// Click to chat
function clickToChatBtn() {
  toChatBtn.addEventListener('click', function() {
    iframe.contentWindow.postMessage(JSON.stringify({ key: 'openChatWindow' }), '*')
    togglePane()
    messageCount.style.display = 'none'
  }, false)
}

clickToChatBtn()

// Show chat window
// eslint-disable-next-line no-undef
bmbot.showChatPane = function(chatPaneOpen) {
  if (chatPaneOpen) {
    toChatBtn.style.display = 'none'
    toChatPane.style.display = 'block'
    messageCount.style.display = 'none'
  } else {
    toChatBtn.style.display = 'block'
    toChatPane.style.display = 'none'
    messageCount.style.display = 'none'
  }
}

const updateMessageCount = function(count) {
  if (count === 0) {
    messageCount.style.display = 'none'
  } else if (getComputedStyle(toChatBtn).display === 'block') {
    messageCount.innerText = count
    messageCount.style.display = 'flex'
  }
}

var stringConstructor = 'test'.constructor
var arrayConstructor = [].constructor
var objectConstructor = {}.constructor

function whatIsIt(object) {
  if (object === null) {
    return 'null'
  } else if (object === undefined) {
    return 'undefined'
  } else if (object.constructor === stringConstructor) {
    return 'String'
  } else if (object.constructor === arrayConstructor) {
    return 'Array'
  } else if (object.constructor === objectConstructor) {
    return 'Object'
  } else {
    return 'unknown'
  }
}

// Receive message from chat window
window.addEventListener('message', function(e) {
  // console.log(e)
  if (e && e.data && whatIsIt(e.data) === 'String') {
    const data = JSON.parse(e.data)
    const key = data.key
    if (key === 'close') {
      togglePane()
    }
    if (key === 'getCId') {
      iframe.contentWindow.postMessage(JSON.stringify({ key: 'getCId', data: window.bmbot.obj.cId }), '*')
    }
    if (key === 'newMessage') {
      const count = data.value
      updateMessageCount(count)
    }
    if (key === 'toggleLeft') {
      toChatPane.style.width = getComputedStyle(toChatPane).width === '960px' ? '480px' : '960px'
    }
  }
}, false)

