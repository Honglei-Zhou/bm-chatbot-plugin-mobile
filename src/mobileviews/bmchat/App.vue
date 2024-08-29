<template>
  <div id="app">
    <BotPage
      ref="botPage"
      :participants="participants"
      :title="chatWindowTitle"
      :title-image-url="titleImageUrl"
      :is-open="isChatOpen"
      :on-close="closeChat"
      :colors="colors"
      :disable-user-list-toggle="disableUserListToggle"
      :message-list="messageList"
      :on-user-input-submit="onMessageWasSent"
      :show-emoji="false"
      :show-file="false"
      :placeholder="placeholder"
      :show-typing-indicator="showTypingIndicator"
      :always-scroll-to-bottom="alwaysScrollToBottom"
      :message-styling="messageStyling"
      @scrollToTop="handleScrollToTop"
      @onType="handleOnType"
    />
    <SmallPage v-if="isSmallChatOpen" ref="smallPage" :colors="colors"/>
  </div>
</template>

<script>
import CloseIcon from '@/assets/icons/close-icon.png'
import OpenIcon from '@/assets/icons/logo-no-bg.svg'
import FileIcon from '@/assets/icons/file.svg'
import CloseIconSvg from '@/assets/icons/close.svg'
import { mapActions, mapState } from 'vuex'
import ChatAvatar from '@/assets/icons/bmbot.png'
import { botAuthService } from '@/api/botAuthService'
import BotPage from '@/components/BotPage/BotPage'
import { whatIsIt } from '@/api/tools'
import AdminAvatar from '@/assets/icons/admin.png'
import SmallPage from '@/components/BotPage/SmallPage'

export default {
  name: 'App',
  components: {
    BotPage,
    SmallPage
  },
  data() {
    return {
      icons: {
        open: {
          img: OpenIcon,
          name: 'default'
        },
        close: {
          img: CloseIcon,
          name: 'default'
        },
        file: {
          img: FileIcon,
          name: 'default'
        },
        closeSvg: {
          img: CloseIconSvg,
          name: 'default'
        }
      },
      participants: [
        {
          id: 'support',
          name: 'BM Bot',
          imageUrl: ChatAvatar
        },
        {
          id: 'admin',
          name: 'John',
          imageUrl: AdminAvatar
        }
      ], // the list of all the participant of the conversation. `name` is the user name, `id` is used to establish the author of a message, `imageUrl` is supposed to be the user avatar.
      chatWindowTitle: 'Honda of Downtown Chicago',
      titleImageUrl: ChatAvatar,
      isChatOpen: true,
      isSmallChatOpen: true,
      // to determine whether the chat window should be open or closed
      // showTypingIndicator: '', // when set to a value matching the participant.id it shows the typing indicator for the specific user
      placeholder: 'Enter your message',
      disableUserListToggle: true,
      colors: {
        header: {
          bg: '#1f95e7',
          text: '#ffffff'
        },
        launcher: {
          bg: '#1f95e7'
        },
        messageList: {
          bg: '#F5F5F5'
        },
        sentMessage: {
          bg: '#1f95e7',
          text: '#ffffff'
        },
        receivedMessage: {
          bg: '#ffffff',
          text: '#222222'
        },
        userInput: {
          bg: '#ffffff',
          text: '#565867'
        },
        toolBar: {
          active: '#1296db',
          inactive: '#565867'
        }
      }, // specifies the color scheme for the component
      alwaysScrollToBottom: true, // when set to true always scrolls the chat to the bottom when new events are in (new message, user starts typing...)
      messageStyling: true // enables *bold* /emph/ _underline_ and such (more info at github.com/mattezza/msgdown),
    }
  },
  computed: {
    ...mapState('bmbot', ['messageList', 'newMessagesCount', 'showTypingIndicator', 'bot'])
  },
  created() {
    window.addEventListener('message', (e) => {
      if (e && e.data && whatIsIt(e.data) === 'String') {
        const eData = JSON.parse(e.data)
        const key = eData.key
        const data = eData.data
        // let key=JSON.parse(e.data).key
        // let data=JSON.parse(e.data).data
        if (key === 'getCId') {
          if (!this.bot.authorized) {
            botAuthService.isAuthorizedBot(data, e.origin).then((resp) => {
              if (resp.data.isAuthorized) {
                this.initBot({ key: data, origin: e.origin })
                setTimeout(() => {
                  this.getAllCars(1)
                }, 2)
                setTimeout(() => {
                // eslint-disable-next-line no-undef
                  var md = new MobileDetect(window.navigator.userAgent)
                  if (md) {
                    this.sendMetaInfo(md)
                  }
                }, 10000)
              } else {
                this.$socket.close()
              }
            }).catch(() => {
              this.$socket.close()
            })
          } else {
            this.initBot({ key: data, origin: e.origin })
            // this.$refs.smallPage.show()
            setTimeout(() => {
              this.getAllCars(1)
            }, 2)
            setTimeout(() => {
              var md = {}
              // console.log(window.location.pathname)
              this.sendMetaInfo(md)
            }, 10000)
          }
        } else if (key === 'openChatWindow') {
          // this.$refs.smallPage.hide()
          this.isSmallChatOpen = false
          this.isChatOpen = true

          this.$refs.botPage.scrollDown()
          this.sendPageViewInfo({ data: data, clicked: 1 })
        } else if (key === 'closeChatWindow') {
          // console.log(data)
          // console.log(e)
          this.sendPageViewInfo({ data: data, clicked: 2 })
        } else if (key === 'updatePageView') {
          this.sendPageViewInfo({ data: data, clicked: 0 })
        }
      }
    }, false)
    window.parent.postMessage(JSON.stringify({ key: 'getCId' }), '*')
  },
  methods: {
    ...mapActions('bmbot', ['sendMessage', 'initBot', 'closeChat', 'getAllCars', 'sendMetaInfo', 'sendPageViewInfo']),
    onMessageWasSent(message) {
      this.sendMessage(message)
      this.$store.commit('bmbot/showIndicator')
      setTimeout(() => {
        this.$store.commit('bmbot/hideIndicator')
      }, 10000)
    },
    handleScrollToTop() {
      console.log('Scroll')
    },
    handleOnType() {
      this.$root.$emit('onType')
      this.userIsTyping = true
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /* margin-top: 60px; */
  display: absolute;
  width: 100%;
  /* width: 960px; */
  height: 100%;
}

 .right-enter, .right-leave-to {
    transform: translate3d(100%, 0, 0)
  }
  .right-leave, .right-enter-to {
    transform: translate3d(0, 0, 0)
  }
  .right-enter-active, .right-leave-active {
    transition: all .6s
  }
  .travel-map {
    height: 400px;
  }
</style>
