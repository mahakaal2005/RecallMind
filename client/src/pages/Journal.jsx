import Placeholder from '../components/Placeholder'

// OWNER: Vansh
export default function Journal() {
  return (
    <Placeholder
      title="Reflection Journal"
      owner="Vansh"
      todo={[
        "Form: text, mood, link to lessons → POST /api/reflections",
        "List → GET /api/reflections (paginated, filter by mood)",
        "Delete → DELETE /api/reflections/:id"
      ]}
    />
  )
}
