import Placeholder from '../components/Placeholder'

// OWNER: Atul
export default function Library() {
  return (
    <Placeholder
      title="Knowledge Library"
      owner="Atul"
      todo={[
        "GET /api/knowledge with page, limit, sortBy, order",
        "Filters: category, source, tags",
        "Card per entry → link to /entries/:id",
        "Pagination controls"
      ]}
    />
  )
}
