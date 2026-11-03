import Placeholder from '../components/Placeholder'

// OWNER: Rajan
export default function Help() {
  return (
    <Placeholder
      title="Help Me With…"
      owner="Rajan"
      todo={[
        'Textarea: describe your problem → POST /api/knowledge/retrieve { problem }',
        'Show matched lessons ranked by score with their source',
        'Button on each lesson: "Write a reflection" → /journal with the lesson pre-linked (coordinate with Vansh)',
      ]}
    />
  )
}
