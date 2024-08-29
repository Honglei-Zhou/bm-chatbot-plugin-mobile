<template>
  <div v-if="isSmallChatOpen" class="small-chat-block">
    <div class="small-chat-window-welcome">
      <div class="small-chat-window-welcome-profile">
        <img :src="iconUrl" class="small-chat-window-welcome-profile-icon">
        <div class="small-chat-window-welcome-profile-text">
          <div class="small-chat-name">Henri</div>
          <div class="small-chat-title">Honda of Downtown Chicago</div>
        </div>
        <div class="small-chat-window-welcome-close-icon" @click="closeSmallPane">
          <img :src="closeUrl" style="width: 10px; height: 10px; margin-top:10px;">
        </div>
      </div>
      <div class="small-chat-window-welcome-message">
        <div v-if="getLastMessage.type === 'text'" class="small-chat-window-welcome-message-text" @click="openChatPane">
          {{ getLastMessage.data.text }}
        </div>
        <div v-else class="small-chat-window-welcome-message-text" @click="openChatPane">
          {{ getLastMessage }}
        </div>
        <Suggestions :small="true" :suggestions="getSuggestions" :colors="colors" @sendSuggestion="_submitSuggestion"/>
      </div>
    </div>
    <!-- <form class="small-chat-window-input" :style="{background: colors.userInput.bg}">
          <div
            role="button"
            tabIndex="0"
            contentEditable="true"
            @keydown="handleKey"
            :placeholder="placeholder"
            class="small-chat-window-input--text"
            ref="userInput"
            :style="{color: colors.userInput.text}"
          >
          </div>
          <div class="small-chat-window-input--buttons">
            <div class="small-chat-window-input--button">
              <SendIcon :onClick="_submitText" :color="colors.userInput.text" />
            </div>
          </div>
        </form> -->
  </div>
</template>

<script>
import SendIcon from '@/components/BotUI/SendIcon'
import IconURL from '@/assets/icons/bmbot.png'
import CloseURL from '@/assets/icons/close-icon.png'
import Suggestions from '@/components/BotUI/SuggestionsSmall'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'SmallPage',
  components: {
    Suggestions,
    SendIcon
  },
  props: {
    colors: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      isSmallChatOpen: true,
      placeholder: 'Enter your message',
      messageStyling: true, // enables *bold* /emph/ _underline_ and such (more info at github.com/mattezza/msgdown),
      iconUrl: IconURL,
      closeUrl: CloseURL
    }
  },
  computed: {
    ...mapState('bmbot', ['lastMessage']),
    getLastMessage() {
      if (this.lastMessage.type === 'text') {
        return this.lastMessage
      } else if (this.lastMessage.type === 'card' || this.lastMessage.type === 'image' || this.lastMessage.type === 'video' || this.lastMessage.type === 'button') {
        return 'You have a new incoming message!'
      } else {
        return { type: 'text', author: 'support', data: { text: `Hi, this is Henri, how can I help you?` }, suggestions: ['trade in', 'service', 'new car sales', 'used car sales', 'dealer information'] }
      }
    },
    getSuggestions() {
      var message = this.getLastMessage
      return message.suggestions ? message.suggestions : []
    }
  },
  methods: {
    ...mapActions('bmbot', ['sendMessage', 'sendMetaInfo']),
    show() {
      this.isSmallChatOpen = true
    },
    hide() {
      this.isSmallChatOpen = false
    },
    _submitText(event) {
      const text = this.$refs.userInput.textContent
      if (text && text.length > 0) {
        //   this.hide()
        //   window.parent.postMessage(JSON.stringify({key:'closeChatPaneSmall'}),'*')
        var message = { author: 'me', type: 'text', data: { text: text }}
        this.sendMessage(message)
        this.$refs.userInput.innerHTML = ''
        window.parent.postMessage(JSON.stringify({ key: 'openChatPane' }), '*')
      }
    },
    handleKey(event) {
      if (event.keyCode === 13 && !event.shiftKey) {
        this._submitText(event)
        event.preventDefault()
      }
    },
    closeSmallPane() {
      this.hide()
      window.parent.postMessage(JSON.stringify({ key: 'closeChatPaneSmall' }), '*')
      this.$store.commit('bmbot/closeChat')
    },
    openChatPane() {
      // this.hide()
      window.parent.postMessage(JSON.stringify({ key: 'openChatPane' }), '*')
    },
    _submitSuggestion(suggestion) {
      var message = { author: 'me', type: 'text', data: { text: suggestion }}
      this.sendMessage(message)
      //   this.hide()
      //   window.parent.postMessage(JSON.stringify({key:'closeChatPaneSmall'}),'*')
      window.parent.postMessage(JSON.stringify({ key: 'openChatPane' }), '*')

      // this.sendItem(suggestion)
    }

  }
}
</script>

<style>
  .small-chat-block{
    position: absolute;
    right: 0px;
    bottom: 0px;
    width: 100%;
    height: 100%;
    /* display: flex;
    flex-direction: column; */
    /* border: 1px solid rgba(0,0,0,0.1); */
    /* box-shadow: 0 30px 40px 0 rgba(26, 34, 40, 0.19); */
  }

  .small-chat-window-welcome{
    height: 148px;
    display: flex;
    z-index: 10;
    flex-direction: column;
    background-color: #ffffff;
    /* margin: 2px; */
    border-radius: 9px;
    border: 1px solid rgba(0,0,0,0.1);
    /* overflow:auto; */
  }

  .small-chat-window-welcome-profile{
    height: 30%;
    display: flex;
  }

  .small-chat-window-welcome-profile-icon{
    margin: 10px 5px 5px 40px;
    width: 30px;
    height: 30px;
  }

  .small-chat-window-welcome-close-icon {
    position: absolute;
    right: 10px;
    top: 10px;
    background-color: #1f95e7;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    opacity: 0.5;
  }

  .small-chat-window-welcome-close-icon:hover {
    opacity: 1;
  }

  .small-chat-window-welcome-profile-text{
    margin: 7px 10px;

  }

  .small-chat-name {
    font-size: 12px;
  }

  .small-chat-title {
    font-size: 12px;
    color: rgba(0,0,0,0.4);
  }

  .small-chat-window-welcome-message{
    padding: 3px 20px;
    text-align: left;
  }

  .small-chat-window-welcome-message-text{
    margin: 5px 0px;
    font-size: 12px;
    max-height: 95px;
    text-overflow: ellipsis;
    overflow:hidden;
  }

  .small-chat-window-input {
    height: 55px;
    margin:2px;
    border: 1px solid rgba(0,0,0,0.1);
    border-radius: 9px;
    background-color: rgba(0,0,0,0.1);
    display: flex;
  }
  .small-chat-window-input--text {
    width: 75%;
    height: 100%;
    padding: 15px;
    resize: none;
    border: none;
    outline: none;
    box-sizing: border-box;
    font-size: 12px;
    font-weight: 400;
    line-height: 1.33;
    white-space: pre-wrap;
    word-wrap: break-word;
    color: #565867;
    -webkit-font-smoothing: antialiased;
    overflow: hidden;
    text-align: left;
  }

  .small-chat-window-input--text:empty:before {
    content: attr(placeholder);
    display: block; /* For Firefox */
    filter: contrast(15%);
    outline: none;
  }

  .small-chat-window-input--buttons{
    width: 15%;
    padding: 15px;
  }
</style>
