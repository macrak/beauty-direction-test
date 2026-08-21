export const Button = ({ children, className, ...props }) => (
  <button
    className={`bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 ${className || ''}`}
    {...props}
  >
    {children}
  </button>
);