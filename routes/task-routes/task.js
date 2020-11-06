const express = require('express');
const router  = express.Router();
const taskModel = require('../../models/task')

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const schedule = require('node-schedule-tz');

//all task dashboard
router.get('/', (req, res, next) => {

//see if user is login
if (!req.session.user){
  res.redirect("auth/login");
  return
}

  taskModel.find({ username: req.body.username })
        .then(allTaskFromDB => {
          res.render('task/alltask', { tasks: allTaskFromDB });
        })
        .catch(err => next(err))
});



//view to add new task
router.get('/new-task', (req, res, next) => {
  res.render('task/ctask');
});



//create new reminder
router.post('/create', (req, res, next) => {
  const reminderInfo = req.body;
  reminderInfo.status = false;
  taskModel.create(reminderInfo)
  .then(newReminder => {

    console.log(newReminder)
    
    // console.log("databaseDate: " + typeof newReminder.date);
    var databaseDate = newReminder.date

    databaseDate = JSON.stringify(databaseDate);

    var databaseDateSplit = databaseDate.split("T");
    
    var d = new Date(databaseDateSplit[0] + " 00:00:00 EST");
    var dYear = d.getFullYear()
    var dMonth = d.getMonth()
    var dDay = d.getDate()
    var hourTime = newReminder.time
    var hourArray = hourTime.split(":");
    var date = new Date(dYear, dMonth, dDay, hourArray[0], hourArray[1], 0,);
    var j = schedule.scheduleJob('testname', date, 'US/Eastern', function(){

      client.calls
          .create({
            //  url: 'Wuba dubb ah dubb dubb! ...What is my purpose?... You pass butter... Oh my god...',
            // url: 'https://handler.twilio.com/twiml/EHb5dbfd8deaa0edd1767130b62fd5b7ad',
            twiml: '<Response><Say>' + newReminder.message + '</Say></Response>',
             to: '+1' + newReminder.phone,
             from: '+17606645590'
           })
          .then(call => console.log(call.sid))
    })
    
    res.redirect('/tasks')
  })
  .catch(err => next
    (err));
});



//update reminder


router.get('/edit-task/:taskId', (req, res, next) => {
  taskModel.findOne({ _id : req.params.taskId })
      .then(updatedTasks => {
        
        res.render("task/edit-task",  updatedTasks );
      })
      .catch(err => next(err));
});


router.post('/edit-task/:taskId', (req, res, next) => {

    let {phone, date, message, subjet, time} = req.body;
    taskModel.findByIdAndUpdate(
    req.params.taskId,
    { phone, date, message, subjet, time },
    { new: true }
   
    
    )
    .then(res.redirect('/tasks'))
    
    
    .catch(err => next(err));

})



//delete reminder 

router.get('/delete/:taskId', (req, res, next) => {
  taskModel.remove({ _id : req.params.taskId })
      .then(res.redirect('/tasks'))



      .catch(err => next(err));
});






module.exports = router;