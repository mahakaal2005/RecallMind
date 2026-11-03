import Placeholder from '../components/Placeholder'

// OWNER: Atul
export default function Search() {
  return (
    <Placeholder
      title="Search"
      owner="Atul"
      todo={[
        'Search box → GET /api/knowledge/search?q=',
        'Show matching entries ranked by relevance, with pagination',
        'Highlight which lesson matched',
      ]}
    />
  )
}
