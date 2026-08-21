export const Input = ({ className, ...props }) => (
  <input className={`w-full border p-2 rounded ${className || ''}`} {...props} />
);