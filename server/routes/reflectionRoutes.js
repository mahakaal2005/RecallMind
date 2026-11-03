const express = require('express');
const reflection = require('../controllers/reflectionController');

const router = express.Router();

router.route('/')
  .get(reflection.getReflections)
  .post(reflection.createReflection);

router.get('/by-lesson/:lessonId', reflection.getReflectionsByLesson);
router.delete('/:id', reflection.deleteReflection);

module.exports = router;
