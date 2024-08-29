const initBot = function(m, ei, q, i, a, j, s) {
  m[i] = m[i] || {}
  m[i].obj = { cId: 201978945124789 }
  j = ei.createElement(q)
  s = ei.getElementsByTagName(q)[0]
  j.async = true
  j.charset = 'UTF-8'
  j.src = 'http://localhost:9901/js/bmbot.js'
  // j.src = 'https://blissmotors-chatbot-plugin-mobile.s3.amazonaws.com/js/bmbot.js'
  s.parentNode.insertBefore(j, s)
  j.onload = j.onreadystatechange = function() {
    // eslint-disable-next-line no-undef
    bmbot.showChatPane(false)
  }
}

initBot(window, document, 'script', 'bmbot')
