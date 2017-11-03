import loop2 from './lib/loop2'
import loop1 from './lib/loop1'
import express from 'express'

const app = express()
const port = 'port'
app.set(port, (process.env.PORT || 3000))

function publishToLoop1 () {
  loop1.publish('loop1.message', {'message': `Message published to Loop1 at ${new Date()}`})
  setTimeout(function() {
    publishToLoop1
  }, 2000)
}

function publishToLoop2 () {
  loop2.publish('loop2.message', {'message': `Message published to Loop2 at ${new Date()}`})
  setTimeout(function() {
    publishToLoop2
  }, 2000)
}

/**
 * Listen on provided port, on all network interfaces.
 */
app.listen(app.get(port), () => {
  let eventsToSubscribe1 = [
    'loop1.message'
  ]
  let eventsToSubscribe2 = [
    'loop2.message'
  ]
  loop1.subscribe(eventsToSubscribe1)
  loop2.subscribe(eventsToSubscribe2)

  console.log(`The application is subscribed to the following events: ${eventsToSubscribe1} & ${eventsToSubscribe2} `)
  console.log('Node app is running on port', app.get(port))
})
