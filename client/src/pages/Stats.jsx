import Placeholder from '../components/Placeholder'

// OWNER: Rajan
export default function Stats() {
  return (
    <Placeholder
      title="Recall Stats"
      owner="Rajan"
      todo={[
        "GET /api/quiz/stats",
        "Total lessons, average recall, never tested, streak",
        "Weakest categories list / bar chart"
      ]}
    />
  )
}
