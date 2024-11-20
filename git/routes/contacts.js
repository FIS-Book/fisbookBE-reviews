var express = require('express');
var router = express.Router();

var contacts = [

  {"name" : "peter", "phone": 12345 },
  
  {"name" : "john", "phone": 6789}
  
  ];

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send(contacts);
});

/*POST CONTACTS*/
router.post('/', function(req, res, next) {
  var contacts = req.body;
  contacts.push(contacts);
  res.sendStatus(201);
});

/* Get contact by name   */
router.get('/:name', function(req, res, next) {
  var name = req.params.name;
  var result = contacts.find(contact => {
    return contact.name === name;
  });
  if(result){
    res.send(result);
  }else{
    res.sendStatus(404);
  }
});

module.exports = router;
