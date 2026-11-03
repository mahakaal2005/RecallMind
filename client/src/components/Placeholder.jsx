// Shown on pages that are not built yet. Remove it from your page once you start building.
export default function Placeholder({ title, owner, todo = [] }) {
  return (
    <section className="card">
      <h1>{title}</h1>
      <p className="muted">Not built yet · owner: {owner}</p>
      {todo.length > 0 && (
        <ul>
          {todo.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      )}
    </section>
  )
}
