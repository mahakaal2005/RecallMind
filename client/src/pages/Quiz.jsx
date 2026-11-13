import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import Pager from '../components/Pager'

// OWNER: Rajan — Active recall quiz flow & quiz history
export default function Quiz() {
  // Mode: 'setup' | 'active' | 'result'
  const [mode, setMode] = useState('setup')

  // Setup options
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [questionCount, setQuestionCount] = useState(5)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState('')

  // Active quiz state
  const [currentQuiz, setCurrentQuiz] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [isRevealed, setIsRevealed] = useState(false)
  const [recordedAnswers, setRecordedAnswers] = useState([]) // [{ questionId, userAnswer, remembered }]
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Completed result state
  const [quizResult, setQuizResult] = useState(null)

  // History state
  const [history, setHistory] = useState([])
  const [historyPage, setHistoryPage] = useState(1)
  const [historyPagination, setHistoryPagination] = useState(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')

  // Load available categories on mount
  useEffect(() => {
    api
      .get('/knowledge?limit=50')
      .then(({ data }) => {
        const cats = Array.from(
          new Set(
            data
              .map((entry) => entry.category)
              .filter(Boolean)
              .map((c) => c.toLowerCase())
          )
        ).sort()
        setCategories(cats)
      })
      .catch(() => {})
  }, [])

  // Load quiz history
  useEffect(() => {
    let stale = false
    setHistoryLoading(true)
    api
      .get(`/quiz/history?page=${historyPage}&limit=5`)
      .then((res) => {
        if (stale) return
        setHistory(res.data || [])
        setHistoryPagination(res.pagination || null)
        setHistoryError('')
      })
      .catch((err) => {
        if (!stale) setHistoryError(err.message)
      })
      .finally(() => {
        if (!stale) setHistoryLoading(false)
      })

    return () => {
      stale = true
    }
  }, [historyPage, quizResult])

  // Start new quiz
  const handleStartQuiz = async (e) => {
    e.preventDefault()
    setGenerating(true)
    setGenerateError('')

    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.set('category', selectedCategory)
      params.set('count', String(questionCount))

      const res = await api.get(`/quiz/generate?${params.toString()}`)
      setCurrentQuiz(res.data)
      setCurrentIndex(0)
      setCurrentAnswer('')
      setIsRevealed(false)
      setRecordedAnswers([])
      setQuizResult(null)
      setMode('active')
    } catch (err) {
      setGenerateError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  // Self-grading a question (Remembered or Forgot)
  const handleGradeQuestion = async (remembered) => {
    if (!currentQuiz || !currentQuiz.questions[currentIndex]) return

    const question = currentQuiz.questions[currentIndex]
    const updatedAnswers = [
      ...recordedAnswers,
      {
        questionId: question.questionId || question._id,
        userAnswer: currentAnswer,
        remembered,
      },
    ]
    setRecordedAnswers(updatedAnswers)

    // Check if more questions remain
    if (currentIndex + 1 < currentQuiz.questions.length) {
      setCurrentIndex((prev) => prev + 1)
      setCurrentAnswer('')
      setIsRevealed(false)
    } else {
      // Last question completed -> submit quiz
      await handleSubmitQuiz(updatedAnswers)
    }
  }

  // Submit all answers to backend
  const handleSubmitQuiz = async (answersToSubmit) => {
    setSubmitting(true)
    setSubmitError('')

    try {
      const res = await api.post(`/quiz/${currentQuiz.quizId || currentQuiz._id}/submit`, {
        answers: answersToSubmit,
      })
      setQuizResult(res.data)
      setMode('result')
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Reset to setup
  const handleReset = () => {
    setMode('setup')
    setCurrentQuiz(null)
    setQuizResult(null)
    setCurrentIndex(0)
    setCurrentAnswer('')
    setIsRevealed(false)
    setRecordedAnswers([])
    setSubmitError('')
    setGenerateError('')
  }

  return (
    <section className="stack">
      <div>
        <h1>Recall Quiz</h1>
        <p className="muted">
          Active recall is the most effective way to remember what you learn. Test your weakest lessons first.
        </p>
      </div>

      {/* SETUP VIEW */}
      {mode === 'setup' && (
        <>
          <form className="card form" onSubmit={handleStartQuiz}>
            <h2>Configure your quiz</h2>
            {generateError && <p className="error" role="alert">{generateError}</p>}

            <div className="row">
              <label>
                Category
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  disabled={generating}
                >
                  <option value="">All categories (mixed)</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Number of questions
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  disabled={generating}
                >
                  <option value={3}>3 questions (quick sprint)</option>
                  <option value={5}>5 questions (standard)</option>
                  <option value={10}>10 questions (deep drill)</option>
                </select>
              </label>
            </div>

            <div className="row">
              <button type="submit" disabled={generating}>
                {generating ? 'Selecting weak lessons…' : 'Start Quiz'}
              </button>
            </div>
          </form>

          {/* PAST QUIZZES / HISTORY */}
          <section className="stack">
            <h2>Recent quiz history</h2>
            {historyError && <p className="error" role="alert">{historyError}</p>}
            {historyLoading && <p className="muted">Loading quiz history…</p>}
            {!historyLoading && !historyError && history.length === 0 && (
              <p className="muted">No past quizzes yet. Generate your first quiz above!</p>
            )}

            <div className="stack">
              {history.map((quiz) => (
                <article key={quiz._id} className="card">
                  <div className="row-between">
                    <div>
                      <strong>
                        {quiz.category
                          ? `Category: ${quiz.category.toUpperCase()}`
                          : 'Mixed categories'}
                      </strong>
                      <span className="muted" style={{ marginLeft: 12 }}>
                        {quiz.questions ? `${quiz.questions.length} questions` : ''}
                      </span>
                    </div>
                    <span
                      className="chip"
                      style={{
                        background:
                          quiz.score >= 70
                            ? 'var(--accent-soft)'
                            : quiz.score >= 40
                              ? 'var(--surface)'
                              : 'transparent',
                        borderColor: quiz.score < 40 ? 'var(--danger)' : undefined,
                        borderWidth: 1,
                        borderStyle: 'solid',
                        fontWeight: 700,
                      }}
                    >
                      Score: {quiz.score ?? 0}%
                    </span>
                  </div>
                  <time className="muted" style={{ fontSize: '0.85rem' }}>
                    Completed: {quiz.completedAt ? new Date(quiz.completedAt).toLocaleString() : 'In progress'}
                  </time>
                </article>
              ))}
            </div>

            <Pager pagination={historyPagination} onPage={setHistoryPage} />
          </section>
        </>
      )}

      {/* ACTIVE QUIZ VIEW */}
      {mode === 'active' && currentQuiz && (
        <section className="card form">
          {submitError && <p className="error" role="alert">{submitError}</p>}

          <div className="row-between">
            <span className="chip">
              Question {currentIndex + 1} of {currentQuiz.questions.length}
            </span>
            {currentQuiz.category && (
              <span className="muted" style={{ fontSize: '0.9rem' }}>
                Category: <strong>{currentQuiz.category}</strong>
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="bar">
            <div
              style={{
                width: `${((currentIndex + 1) / currentQuiz.questions.length) * 100}%`,
              }}
            />
          </div>

          {/* Question Details */}
          <div className="lesson-row" style={{ marginTop: 8 }}>
            <h3>{currentQuiz.questions[currentIndex]?.prompt}</h3>
            {currentQuiz.questions[currentIndex]?.hint && (
              <p className="muted" style={{ fontStyle: 'italic', margin: '4px 0' }}>
                💡 {currentQuiz.questions[currentIndex].hint}
              </p>
            )}
          </div>

          {/* User Answer Input */}
          <label>
            Your recall attempt
            <textarea
              rows={4}
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type what you remember about this lesson..."
              disabled={isRevealed || submitting}
            />
          </label>

          {/* Reveal button */}
          {!isRevealed ? (
            <div className="row">
              <button
                type="button"
                onClick={() => setIsRevealed(true)}
                disabled={submitting}
              >
                Reveal Answer & Self-Grade
              </button>
              <button
                type="button"
                className="secondary"
                onClick={handleReset}
                disabled={submitting}
              >
                Cancel Quiz
              </button>
            </div>
          ) : (
            <div className="stack" style={{ marginTop: 8 }}>
              <div
                className="card"
                style={{
                  background: 'var(--accent-soft)',
                  borderColor: 'var(--accent)',
                }}
              >
                <strong>Self-assessment prompt:</strong>
                <p style={{ margin: '6px 0 0' }}>
                  Did you successfully recall the key idea of this lesson?
                </p>
              </div>

              <div className="row">
                <button
                  type="button"
                  style={{ background: 'var(--success)', flex: 1 }}
                  onClick={() => handleGradeQuestion(true)}
                  disabled={submitting}
                >
                  ✓ Remembered (+20 recall)
                </button>
                <button
                  type="button"
                  className="danger"
                  style={{ flex: 1 }}
                  onClick={() => handleGradeQuestion(false)}
                  disabled={submitting}
                >
                  ✗ Forgot (-15 recall)
                </button>
              </div>
            </div>
          )}

          {submitting && <p className="muted">Calculating results and updating recall scores…</p>}
        </section>
      )}

      {/* RESULT VIEW */}
      {mode === 'result' && quizResult && (
        <section className="stack">
          <div className="card form success-card">
            <h2 className="success-text">Quiz Complete!</h2>
            <div className="metric-grid">
              <div className="card metric">
                <span>Final Score</span>
                <strong style={{ color: quizResult.score >= 60 ? 'var(--success)' : 'var(--danger)' }}>
                  {quizResult.score}%
                </strong>
              </div>
              <div className="card metric">
                <span>Remembered</span>
                <strong>
                  {quizResult.rememberedCount} / {quizResult.total}
                </strong>
              </div>
            </div>
            <div className="row" style={{ marginTop: 12 }}>
              <button onClick={handleReset}>Take Another Quiz</button>
              <Link to="/stats" className="button secondary" style={{ textDecoration: 'none' }}>
                <button type="button" className="secondary">View Recall Stats</button>
              </Link>
            </div>
          </div>

          <h2>Answer Review & Reveal</h2>
          <div className="stack">
            {quizResult.questions?.map((item, idx) => (
              <article key={item.questionId || idx} className="card">
                <div className="row-between">
                  <strong>Question {idx + 1}: {item.title || item.prompt}</strong>
                  <span
                    className="chip"
                    style={{
                      background: item.remembered ? 'var(--accent-soft)' : 'transparent',
                      color: item.remembered ? 'var(--success)' : 'var(--danger)',
                      borderColor: item.remembered ? 'var(--success)' : 'var(--danger)',
                      borderWidth: 1,
                      borderStyle: 'solid',
                    }}
                  >
                    {item.remembered ? 'Remembered' : 'Forgot'}
                  </span>
                </div>

                <div style={{ marginTop: 10 }}>
                  <p className="muted" style={{ margin: '0 0 4px', fontSize: '0.85rem' }}>
                    Stored Lesson:
                  </p>
                  <blockquote
                    style={{
                      margin: '0 0 10px',
                      paddingLeft: 12,
                      borderLeft: '3px solid var(--accent)',
                      fontWeight: 500,
                    }}
                  >
                    {item.lessonText}
                  </blockquote>
                </div>

                {item.userAnswer && (
                  <div>
                    <p className="muted" style={{ margin: '0 0 4px', fontSize: '0.85rem' }}>
                      Your Answer:
                    </p>
                    <p style={{ margin: '0 0 8px', fontStyle: 'italic' }}>
                      "{item.userAnswer}"
                    </p>
                  </div>
                )}

                <div className="row-between" style={{ marginTop: 8, fontSize: '0.85rem' }}>
                  <span className="muted">Source: {item.source}</span>
                  <span className="muted">
                    New Recall Score: <strong>{item.newRecallScore}%</strong>
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </section>
  )
}
