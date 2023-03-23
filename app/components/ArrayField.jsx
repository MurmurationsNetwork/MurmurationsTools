import { useState } from 'react'

export default function ArrayField({ fieldName, fieldType, isFieldRequired }) {
  const [inputValues, setInputValues] = useState([''])

  function handleChange(event, index) {
    const values = [...inputValues]
    values[index] = event.target.value
    setInputValues(values)
  }

  function handleAdd(event) {
    event.preventDefault()
    const values = [...inputValues, '']
    setInputValues(values)
  }

  function handleRemove(event, index) {
    event.preventDefault()
    const values = [...inputValues]
    values.splice(index, 1)
    setInputValues(values)
  }

  return (
    <div>
      {inputValues.map((value, index) => (
        <div key={index} className="flex justify-around items-center">
          <input
            type={fieldType}
            value={value}
            name={fieldName + '[' + index + ']'}
            aria-label={fieldName + '[' + index + ']'}
            onChange={event => handleChange(event, index)}
            className="form-input w-full dark:bg-slate-700 mr-2"
            required={isFieldRequired}
          />
          {index === 0 && isFieldRequired ? (
            <></>
          ) : (
            <button
              onClick={event => handleRemove(event, index)}
              className="rounded-full bg-yellow-500 dark:bg-green-200 hover:bg-yellow-400 dark:hover:bg-green-100 text-white dark:text-gray-800 font-bold py-2 px-4 my-4"
            >
              Remove
            </button>
          )}
        </div>
      ))}
      <button
        onClick={event => handleAdd(event)}
        className="rounded-full bg-red-500 dark:bg-purple-200 hover:bg-red-400 dark:hover:bg-purple-100 text-white dark:text-gray-800 hover:scale-110 font-bold py-2 px-4 my-4"
      >
        Add
      </button>
    </div>
  )
}
