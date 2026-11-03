import Placeholder from '../components/Placeholder'

// OWNER: Atul
export default function EntryForm() {
  return (
    <Placeholder
      title="Add / Edit Entry"
      owner="Atul"
      todo={[
        "Fields: title, source, sourceType, category, tags",
        "Dynamic list of lessons (lessonText, context, pageNumber)",
        "POST /api/knowledge (add) or PUT /api/knowledge/:id (edit, when URL has :id)",
        "Show validation errors from the API"
      ]}
    />
  )
}
