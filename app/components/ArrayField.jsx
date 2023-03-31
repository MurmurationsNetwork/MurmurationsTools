import React, { useState } from 'react'
import RecursiveForm from './RecursiveForm'

export default function ArrayField({
  schema,
  profileData,
  parentFieldName,
  isFieldRequired,
  requiredProperties
}) {
  // we need to handle the items type is array or object
  let defaultState = ''
  if (schema?.items?.type === 'object') {
    defaultState = {}
    for (const property in schema?.items?.properties) {
      defaultState[property] = ''
    }
  }

  const [inputValues, setInputValues] = useState([defaultState])

  function handleChange(event, index) {
    const values = [...inputValues]
    values[index] = event.target.value
    setInputValues(values)
  }

  function handleAdd(event) {
    event.preventDefault()
    const values = [...inputValues, defaultState]
    setInputValues(values)
  }

  function handleRemove(event, index) {
    event.preventDefault()
    const values = [...inputValues]
    values.splice(index, 1)
    setInputValues(values)
  }

  if (schema?.items?.type === 'object') {
    return (
      <fieldset className="border-dotted border-4 border-slate-300 p-4 my-4">
        <legend className="block text-md font-bold">
          {schema?.title}
          {requiredProperties?.includes(parentFieldName) ? (
            <span className="text-red-500 dark:text-red-400"> *</span>
          ) : (
            <></>
          )}
        </legend>
        <div className="text-xs">{schema?.description}</div>
        {inputValues.map((value, index) => (
          <div key={parentFieldName + '[' + index + ']'}>
            <RecursiveForm
              schema={schema?.items}
              profileData={value}
              parentFieldName={parentFieldName + '[' + index + ']'}
              isFieldRequired={isFieldRequired}
              requiredProperties={requiredProperties}
              inputValues={inputValues[index]}
              setInputValues={setInputValues}
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
      </fieldset>
    )
  } else {
    return (
      <fieldset className="border-dotted border-4 border-slate-300 p-4 my-4">
        <legend className="block text-md font-bold">
          {schema?.title}
          {requiredProperties?.includes(parentFieldName) ? (
            <span className="text-red-500 dark:text-red-400"> *</span>
          ) : (
            <></>
          )}
        </legend>
        <div className="text-xs">{schema?.description}</div>
        {inputValues.map((value, index) => (
          <div key={index} className="flex justify-around items-center">
            <input
              type={schema?.items?.type === 'number' ? 'number' : 'text'}
              value={value}
              name={parentFieldName + '[' + index + ']'}
              aria-label={parentFieldName + '[' + index + ']'}
              onChange={event => handleChange(event, index)}
              className="form-input w-full focus:dark:bg-gray-500 dark:bg-gray-700 mr-2"
              required={isFieldRequired}
              min={schema?.minimum}
              max={schema?.maximum}
              minLength={schema?.minLength}
              maxLength={schema?.maxLength}
              pattern={schema?.pattern}
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
      </fieldset>
    )
  }
}
