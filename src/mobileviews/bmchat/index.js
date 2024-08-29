import Vue from 'vue'
import App from './App'
import router from '@/router'
import VTooltip from 'v-tooltip'
import VueSocketIO from 'vue-socket.io'
import store from '@/store'
import VueMoment from 'vue-moment'
import moment from 'moment-timezone'
import commonConfig from '@/api/common'

Vue.use(VueMoment, {
  moment
})

Vue.use(VTooltip)

Vue.use(new VueSocketIO({
  debug: false,
  // connection: 'https://middleware-dev.bmhax.com',
  connection: commonConfig.socketUrl,
  vuex: {
    store,
    actionPrefix: 'SOCKET_'
  }
}))

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
