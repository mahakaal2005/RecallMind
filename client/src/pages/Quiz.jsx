import Placeholder from '../components/Placeholder'

// OWNER: Rajan
export default function Quiz() {
  return (
    <Placeholder
      title="Recall Quiz"
      owner="Rajan"
      todo={[
        "Pick category + count → GET /api/quiz/generate",
        "One question at a time: type answer, reveal lesson, mark Remembered / Forgot",
        "POST /api/quiz/:quizId/submit → show score",
        "Past quizzes from GET /api/quiz/history"
      ]}
    />
  )
}
