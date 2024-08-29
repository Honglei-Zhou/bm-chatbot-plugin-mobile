<template>
  <div
    :class="{opened: isOpen, closed: !isOpen}"
    class="sc-bot-page"
  >
    <BotPageHeader
      :title="title"
      :image-url="titleImageUrl"
      :on-close="onClose"
      :colors="colors"
      :disable-user-list-toggle="disableUserListToggle"
      @userList="handleUserListToggle"
    />
    <UserList
      v-if="showUserList"
      :participants="participants"
    />
    <Aboutus ref="aboutUs"/>
    <InventoryList ref="inventoryList" :key="randomKey" @sendItem="sendItem" @backToChat="backToChat"/>
    <ContactInformation ref="contactInformation"/>
    <WorkingHours ref="workingHours"/>
    <SMSPage ref="smsPage"/>
    <ChatWindow
      ref="chatWindow"
      :message-list="messageList"
      :on-user-input-submit="onUserInputSubmit"
      :participants="participants"
      :title="title"
      :title-image-url="titleImageUrl"
      :is-open="isOpen"
      :on-close="onClose"
      :show-emoji="showEmoji"
      :show-file="showFile"
      :placeholder="placeholder"
      :show-typing-indicator="showTypingIndicator"
      :colors="colors"
      :always-scroll-to-bottom="alwaysScrollToBottom"
      :message-styling="messageStyling"
      @scrollToTop="$emit('scrollToTop')"
      @onType="$emit('onType')"
    />
    <ToolBar
      ref="toolBar"
      :handle-bot-page-toggle="handleBotPageToggle"
      :colors="colors"
    />
  </div>
</template>

<script>
import BotPageHeader from '@/components/BotPage/BotPageHeader.vue'
import UserList from '@/components/BotUI/UserList.vue'
import Aboutus from '@/components/BotPage/Aboutus'
import InventoryList from '@/components/BotPage/InventoryList'
import ContactInformation from '@/components/BotPage/ContactInformation'
import WorkingHours from '@/components/BotPage/WorkingHours'
import SMSPage from '@/components/BotPage/SMSPage'
import ToolBar from '@/components/BotUI/ToolBar'
import ChatWindow from '@/components/BotUI/ChatWindow'

export default {
  name: 'BotPage',
  components: {
    BotPageHeader,
    UserList,
    Aboutus,
    InventoryList,
    ContactInformation,
    WorkingHours,
    SMSPage,
    ToolBar,
    ChatWindow
  },
  props: {
    onClose: {
      type: Function,
      required: true
    },
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
    },
    disableUserListToggle: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showUserList: false,
      inventoryElements: [],
      pageName: 'chat'
    }
  },
  computed: {
    messages() {
      const messages = this.messageList

      return messages
    },
    randomKey() {
      var length = 5
      var result = ''
      var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      var charactersLength = characters.length
      for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
      }
      return result
    }
  },
  methods: {
    handleUserListToggle(showUserList) {
      this.showUserList = showUserList
    },
    sendItem(item) {
      this.$refs.chatWindow.sendItem(item)
    },
    backToChat() {
      this.$refs.toolBar.showChat()
    },
    _showAboutus() {
      this.$refs.aboutUs.show()
    },
    _hideAboutus() {
      this.$refs.aboutUs.hide()
    },
    _showProfile() {
      this.showUserList = true
    },
    _hideProfile() {
      this.showUserList = false
    },
    _showInventory() {
      this.$refs.inventoryList.show()
    },
    _hideInventory() {
      this.$refs.inventoryList.hide()
    },
    _showContact() {
      this.$refs.contactInformation.show()
    },
    _hideContact() {
      this.$refs.contactInformation.hide()
    },
    _showHours() {
      this.$refs.workingHours.show()
    },
    _hideHours() {
      this.$refs.workingHours.hide()
    },
    _showSMS() {
      this.$refs.smsPage.show()
    },
    _hideSMS() {
      this.$refs.smsPage.hide()
    },
    _showChat() {
      this.$refs.chatWindow.show()
    },
    _hideChat() {
      this.$refs.chatWindow.hide()
    },
    _hideAll() {
      this._hideProfile()
      this._hideAboutus()
      this._hideInventory()
      this._hideContact()
      this._hideHours()
      this._hideSMS()
      this._hideChat()
    },
    pageHandler(name) {
      this._hideAll()
      if (name === 'profile') {
        this._showProfile()
      } else if (name === 'hours') {
        this._showHours()
      } else if (name === 'info') {
        this._showAboutus()
      } else if (name === 'inventory') {
        // this.$store.dispatch('bmbot/getAllCars', 1)
        this._showInventory()
      } else if (name === 'contact') {
        this._showContact()
      } else if (name === 'sms') {
        this._showSMS()
      } else if (name === 'chat') {
        this._showChat()
      }
    },
    scrollDown() {
      this.$refs.chatWindow.scrollDown()
    },
    handleBotPageToggle(item) {
      // console.log(this.$refs)
      this.pageName = item.name
      if (item.show) {
        if (!this.isPageOpen) {
          this.$nextTick(() => {
            // console.log(this.$refs)
            this.pageHandler(item.name)
          })
        } else {
          this.pageHandler(item.name)
        }
      } else {
        this.onClose()
      }
    }
  }
}
</script>
<style scoped>
.sc-bot-page {
  width: 100%;
  height: 100%;
  bottom: 0px;
  left: 0px;
  right: 0px;
  /* margin: 2px 0px 2px 2px; */
  position: fixed;
  box-sizing: border-box;
  border: 1px solid rgba(0,0,0,0.2);
  /* box-shadow: 0 0 1px 1px rgba(0,0,0,0.2);  */
  border-radius: 9px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.sc-bot-page.closed {
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
