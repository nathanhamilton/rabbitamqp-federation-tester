import config from '../config.js'
import amqp from 'amqplib/callback_api'

class Loop {
  /**
   * Contains the connection string with rabbmq server
   * @param {string} user credential to connect with RabbitMQ
   * @param {string} pass password credential to connect with RabbitMQ
   * @param {string} url server url
   */
  constructor (user, pass, url) {
    this.amqpHost = `amqp://${user}:${pass}@${url}`
  }

  /**
   * Publish messages to loop client in order to ship data
   * @param {string} key associated with the event. e.g. user.lead.created
   * @param {string} message to publish
   */
  publish (key, message) {
    let self = this
    amqp.connect(this.amqpHost, function (err, conn) {
      if (err) {
        console.log(`Error publishing to the LOOP: ${err}`)
        self.retry(5, function () {
          self.publish(key, message)
        })
        return false
      }
      conn.createChannel(function (err, ch) {
        if (err) { console.warn(err) }
        var ex = config.LOOP_EXCHANGE
        ch.assertExchange(ex, 'topic', {durable: false})
        ch.publish(ex, key, new Buffer(message))
        console.log("[x] Sent %s: '%s'", key, message)
      })

      setTimeout(function () { conn.close() }, 1000)
    })
  }

  /**
   * Subscribe messages to loop client in order to treceve data
   * @param {array} keys associated with the event. e.g. user.lead.created
   */
  subscribe (keys) {
    let self = this
    amqp.connect(this.amqpHost, function (err, conn) {
      if (err) {
        console.log(`Error subscribing to the LOOP: ${err}`)
        self.retry(10, function () {
          self.subscribe(keys)
        })
        return false
      }

      conn.createChannel(function (err, ch) {
        if (err) { console.warn(err) }

        var ex = config.LOOP_EXCHANGE

        ch.assertExchange(ex, 'topic', {durable: false})

        ch.assertQueue(config.LOOP_TOPIC + '-client', {exclusive: false}, function (err, q) {
          if (err) { console.warn(err) }
          console.log(' [*] Client subscribed, waiting for events')

          keys.forEach(function (key) {
            ch.bindQueue(q.queue, ex, key)
          })
          ch.consume(q.queue, function (msg) {
            console.log(`Message Received by Loop2 at ${new Date()}: ${msg}`)
          }, {noAck: true})
        })
      })
    })
  }

  /**
   * Retries a method after a given amount of time
   * @param {integer} time in seconds
   * @param {function} the function to be retried
   */
  retry (reconnectTimeout, callback) {
    console.log(`Scheduling reconnect in ${reconnectTimeout}s`)
    setTimeout(function () {
      console.log('Now attempting reconnect ...')
      callback()
    }, reconnectTimeout * 1000)
  }

}
export default new Loop(config.LOOP_USER_2, config.LOOP_PASS_2, config.LOOP_URL_2)