import { useState } from 'react'
import { Eye, EyeSlash } from '@phosphor-icons/react'
import '../pages/Auth.css' // Import style dependencies

function FormInput({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  icon: IconLeft,
  showPasswordToggle = false,
  style = {},
  inputStyle = {},
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false)

  const inputType = showPasswordToggle 
    ? (showPassword ? 'text' : 'password') 
    : type

  return (
    <div className="input-group" style={style}>
      {label && <label className="input-label" htmlFor={id}>{label}</label>}
      <div className="input-wrapper">
        {IconLeft && (
          <span className="input-icon-left">
            <IconLeft size={20} />
          </span>
        )}
        <input
          className="input-field"
          type={inputType}
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          style={{ ...(IconLeft ? {} : { paddingLeft: '16px' }), ...inputStyle }}
          {...rest}
        />
        {showPasswordToggle && (
          <button
            className="input-icon-right"
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && <span className="error-message">{error}</span>}
    </div>
  )
}

export default FormInput
