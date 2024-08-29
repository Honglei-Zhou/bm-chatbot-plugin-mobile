import Vue from 'vue'
import Vuex from 'vuex'

import { bmbot } from './modules/bmbot'
import createPersistedState from 'vuex-persistedstate'
// import * as Cookies from 'js-cookie'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    bmbot
  },
  plugins: [createPersistedState()]
  // plugins: [createPersistedState({
  //   storage: {
  //     getItem: key => Cookies.get(key),
  //     // Please see https://github.com/js-cookie/js-cookie#json, on how to handle JSON.
  //     setItem: (key, value) =>
  //       Cookies.set(key, value, { expires: 3, secure: true }),
  //     removeItem: key => Cookies.remove(key),
  //   },
  // })]
})