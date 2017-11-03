const dotenv = require('dotenv')
dotenv.config({silent: true})

var config = {
  LOOP_USER_1: process.env.LOOP_USER_1,
  LOOP_URL_1: process.env.LOOP_URL_1,
  LOOP_PASS_1: process.env.LOOP_PASS_1,
  LOOP_USER_2: process.env.LOOP_USER_2,
  LOOP_URL_2: process.env.LOOP_URL_2,
  LOOP_PASS_2: process.env.LOOP_PASS_2,
  LOOP_EXCHANGE: 'loop',
  LOOP_TOPIC: 'federation-tester'
}

export default config
