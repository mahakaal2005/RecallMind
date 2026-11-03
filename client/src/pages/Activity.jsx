import Placeholder from '../components/Placeholder'

// OWNER: Vansh
export default function Activity() {
  return (
    <Placeholder
      title="Activity Log"
      owner="Vansh"
      todo={[
        "GET /api/activity/log → recent lines",
        "GET /api/activity/summary → counts per event type",
        "GET /api/system/info → system card (OS module)"
      ]}
    />
  )
}
