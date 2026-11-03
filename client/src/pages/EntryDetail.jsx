import Placeholder from '../components/Placeholder'

// OWNER: Atul
export default function EntryDetail() {
  return (
    <Placeholder
      title="Entry Detail"
      owner="Atul"
      todo={[
        "GET /api/knowledge/:id",
        "Show lessons with recallScore",
        "Edit + Delete buttons",
        "Show reflections for each lesson (Member 4 endpoint /api/reflections/by-lesson/:lessonId)"
      ]}
    />
  )
}
