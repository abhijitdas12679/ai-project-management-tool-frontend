export default function Badge({ value }) {
  const text = value || "";

  const key = text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");

  return (
    <span className={`premium-badge badge-${key}`}>
      {text}
    </span>
  );
}