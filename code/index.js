var apm = require('elastic-apm-node').start({
    // Set required service name (allowed characters: a-z, A-Z, 0-9, -, _, and space)
    serviceName: 'app-boron',
    // Use if APM Server requires a token
    secretToken: '',
    // Set custom APM Server URL (default: http://localhost:8200)
    serverUrl: 'http://apm_server:8200'
})

const express = require('express'),
  mongodb = require('mongodb'),
  app = express(),
  bodyParser = require('body-parser'),
  url = process.env.MONGODB_URI || 'mongodb://localhost:27017/board'


mongodb.MongoClient.connect(url, function(err, db) {
  if (err) {
    console.error(err)
    process.exit(1)
    
  }

  app.use(bodyParser.json())
  app.use(express.static('public'))

  app.use(function(req, res, next){
    req.messages = db.collection('messages')
    return next()
  })

  app.get('/messages', function(req, res, next) {
    req.messages.find({}, {sort: {_id: -1}}).toArray(function(err, docs){
      if (err) return next(err)
      return res.json(docs)
    })
  })
  app.post('/messages', function(req, res, next){
    console.log(req.body)
    let newMessage = {
      message: req.body.message,
      name: req.body.name
    }
    req.messages.insert(newMessage, function (err, result) {
      if (err) return next(err)
      return res.json(result.ops[0])
    })
  })

  app.listen(3000)
})
