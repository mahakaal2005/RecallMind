import Placeholder from '../components/Placeholder'

// OWNER: Vansh
export default function Upload() {
  return (
    <Placeholder
      title="Upload Notes"
      owner="Vansh"
      todo={[
        "File input (.txt / .md) → api.upload(\"/knowledge/upload\", formData)",
        "Show parsed title + lesson count",
        "Quick capture form → POST /api/knowledge/quick"
      ]}
    />
  )
}
