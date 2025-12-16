export default function TabButton({ label, active, onClick, disabled }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`px-4 py-2 text-sm rounded-t-md
        ${active ? "border-b-2 border-blue-500 font-semibold" : ""}
        ${disabled ? "opacity-40 cursor-not-allowed" : ""}
      `}
    >
      {label}
    </button>
  );
}
