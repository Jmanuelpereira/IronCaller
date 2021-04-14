const express = require('express');
const router  = express.Router();
const  commentsModel = require('../../models/comments')




router.get('/', (req, res, next) => {

  })



//create new comment
router.post('/post-comment', (req, res, next) => {
  const commentDetails = req.body;
  commentsModel.create(commentDetails)
  .then(res.redirect('/'))

  .catch(err => next
    (err))

})


router.get('../users/profile/:id', (req, res, next) => {

  const userID = { _id:req.params.id}

  commentsModel.find(userID)

    .then(CommentsDB => { allComments: CommentsDB })


      .catch(err => next(err));
});



module.exports = router;