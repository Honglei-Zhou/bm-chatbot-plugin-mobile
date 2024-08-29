<template>
  <div
    v-show="showChat"
    class="sc-chat-window"
  >
    <!-- <UserList
      v-if="showUserList"
      :participants="participants"
    /> -->
    <MessageList
      ref = "messages"
      :messages="messages"
      :participants="participants"
      :show-typing-indicator="showTypingIndicator"
      :colors="colors"
      :always-scroll-to-bottom="alwaysScrollToBottom"
      :message-styling="messageStyling"
      @scrollToTop="$emit('scrollToTop')"
      @sendItem="sendItem"
    />
    <DateTimePicker
      ref="timePicker"
      @sendItem="sendItem"
      @closeDateTimePicker="closeDateTimePicker"
    />
    <UserInput
      ref="userInput"
      :show-emoji="showEmoji"
      :on-submit="onUserInputSubmit"
      :suggestions="getSuggestions()"
      :show-file="showFile"
      :placeholder="placeholder"
      :colors="colors"
      @onType="$emit('onType')"
      @toggleDateTimePicker="toggleDateTimePicker"
    />
    <VueGallery v-show="showPreview" :images="slideImages" :index="index" @close="handleClose"/>
  </div>
</template>

<script>
import BotHeader from '@/components/BotUI/Header.vue'
import MessageList from '@/components/BotUI/MessageList.vue'
import UserInput from '@/components/BotUI/UserInput.vue'
import UserList from '@/components/BotUI/UserList.vue'
import VueGallery from 'vue-gallery'
import DateTimePicker from '@/components/BotUI/DateTimePicker'

export default {
  name: 'Chat',
  components: {
    BotHeader,
    MessageList,
    UserInput,
    UserList,
    VueGallery,
    DateTimePicker
  },
  props: {
    showEmoji: {
      type: Boolean,
      default: false
    },
    showFile: {
      type: Boolean,
      default: false
    },
    participants: {
      type: Array,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    titleImageUrl: {
      type: String,
      default: ''
    },
    onUserInputSubmit: {
      type: Function,
      required: true
    },
    onClose: {
      type: Function,
      required: true
    },
    messageList: {
      type: Array,
      default: () => []
    },
    isOpen: {
      type: Boolean,
      default: () => false
    },
    placeholder: {
      type: String,
      default: 'Write a reply'
    },
    showTypingIndicator: {
      type: String,
      required: true
    },
    colors: {
      type: Object,
      required: true
    },
    alwaysScrollToBottom: {
      type: Boolean,
      required: true
    },
    messageStyling: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      showPreview: false,
      showChat: true,
      slideImages: [],
      index: null
    }
  },
  computed: {
    messages() {
      const messages = this.messageList
      return messages
    }
  },
  methods: {
    getSuggestions() {
      return this.messages.length > 0 ? this.messages[this.messages.length - 1].suggestions : []
    },
    sendItem(item) {
      this._send(item)
    },
    _send(item) {
      this.$refs.userInput._submitSuggestion(item.payload)
    },
    scrollDown() {
      this.$refs.messages.scrollDown()
    },
    handleClose(event) {
      this.index = null
    },
    openPreview(message) {
      this.slideImages = message
      this.index = 0
    },
    toggleDateTimePicker(isActive) {
      if (isActive) {
        this.$refs.timePicker.show()
      } else {
        this.$refs.timePicker.hide()
      }
    },
    closeDateTimePicker() {
      this.$refs.userInput.closeDateIcon()
      console.log('Close')
    },
    show() {
      this.showChat = true
    },
    hide() {
      this.showChat = false
    }
  }
}
</script>
<style scoped>
.sc-chat-window {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: 0.3s ease-in-out;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
}
.image-preview-box {
  position: absolute;
  top: 0px;
  height: 100%;
  width: 100%;
  background: rgba(0,0,0,0.7);
  z-index: 100;
}

.image-preview {
  width: 100%;
  margin-top: 200px;
}
.sc-chat-window.closed {
  opacity: 0;
  visibility: hidden;
}

.sc-message--me {
  text-align: right;
}
.sc-message--them {
  text-align: left;
}
</style>
