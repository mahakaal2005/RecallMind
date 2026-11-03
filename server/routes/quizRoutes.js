const express = require('express');
const quiz = require('../controllers/quizController');

const router = express.Router();

router.get('/generate', quiz.generateQuiz);
router.get('/history', quiz.getQuizHistory);
router.get('/stats', quiz.getStats);
router.post('/:quizId/submit', quiz.submitQuiz);

module.exports = router;
