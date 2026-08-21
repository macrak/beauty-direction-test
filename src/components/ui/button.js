export const Button = ({ children, className, ...props }) => (
  <button
    className={`bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-pink-500 ${className || ''}`}
    {...props}
  >
    {children}
  </button>
);