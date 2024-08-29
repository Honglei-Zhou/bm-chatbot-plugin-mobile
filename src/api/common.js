// const baseUrl = 'https://9w7b1r8iy1.execute-api.us-east-1.amazonaws.com/dev'
// const socketUrl = 'https://middleware-dev.bmhax.com'
// const baseUrl = 'http://127.0.0.1:5001'
// const socketUrl = 'http://127.0.0.1:5000'

let baseUrl = 'https://fqvrhq3xy0.execute-api.us-east-1.amazonaws.com/v1/'
let socketUrl = 'https://middleware.bmhax.com'

const stage = 'dev'

if (stage === 'dev') {
  baseUrl = 'https://9w7b1r8iy1.execute-api.us-east-1.amazonaws.com/dev'
  socketUrl = 'https://middleware-dev.bmhax.com'
}

export default {
  baseUrl: baseUrl,
  socketUrl: socketUrl,
  stage: stage
  // botUrl: botUrl
}
