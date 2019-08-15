require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
var protobuf = require('protocol-buffers')
const app = express();
const router = express.Router();

var messages = protobuf(fs.readFileSync(process.env.PROTOFILE))

const port = parseInt(process.env.PORT) || 3000;

app.enable('trust proxy');

const amqp = require('amqplib/callback_api');

amqp.connect(process.env.AMQP_URI, (err, conn) => {
    if (err) 
        throw err;
    conn.createChannel((err, channel) => {
        var topic = process.env.TOPIC;
        var amqp_topic = process.env.AMQP_TOPIC;
        channel.assertExchange(topic, 'topic', {
            durable: false
        });

        channel.assertQueue('', {
            exclusive: true
          }, function(error2, q) {
            if (error2) {
              throw error2;
            }
            console.log(' [*] Waiting for logs. To exit press CTRL+C');
      
              channel.bindQueue(topic, amqp_topic, topic);
      
            channel.consume(topic, function(msg) {
                var dec = messages.ContinuousStream.decode(msg.content);
                console.log(dec);
            }, {
              noAck: true
            });
        });
    })
});

// console.log(fs.readFileSync(process.env.BUF_FILES));
// app.get('/', (req, res) => {
//     var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
//     console.log(ip);
//     res.send('hahahahaha');
// })

// app.listen(port, () => console.log('Worker 1 Listening at localhost:'+port));