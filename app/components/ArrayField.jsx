import React, { useState } from 'react'
import RecursiveForm from './RecursiveForm'
import { constructState } from '../utils/constructState'
import { parsePath } from '../utils/parsePath'

export default function ArrayField({
  schema,
  parentFieldName,
  isFieldRequired,
  requiredProperties,
  inputs,
  setInputs
}) {
  const [currentArray, setCurrentArray] = useState(
    getCurrentArray(inputs, parentFieldName)
  )

  // handle the change event from the input and change the state in the parent component
  const handleChange = (event, parentFieldName, itemIndex) => {
    event.preventDefault()
    // use regex to get the array and object path.
    const parts = parsePath(parentFieldName)

    // create a copy of the state, and get the value from the input
    const values = inputs
    const value = event.target.value

    // traverse the object and update the value
    let currentObj = values
    for (let i = 0; i < parts.length; i++) {
      let part = parts[i]
      // if the part can be parsed as an integer, then it is an array index
      const index = parseInt(part)
      if (!isNaN(index)) {
        part = index
      }
      if (i === parts.length - 1) {
        const currentObjValues = [...currentObj[part]]
        currentObjValues[itemIndex] = value
        currentObj[part] = currentObjValues
      } else {
        currentObj = currentObj[part]
      }
    }

    setInputs(values)
    setCurrentArray(getCurrentArray(inputs, parentFieldName))
  }

  const handleAdd = (event, parentFieldName, schema) => {
    event.preventDefault()
    // use schema to construct the state
    const defaultState = constructState(schema?.items)

    // use regex to get the array and object path.
    const parts = parsePath(parentFieldName)

    // create a copy of the state, and get the value from the input
    const values = inputs

    // traverse the object and update the value
    let currentObj = values
    for (let i = 0; i < parts.length; i++) {
      let part = parts[i]
      // if the part can be parsed as an integer, then it is an array index
      const index = parseInt(part)
      if (!isNaN(index)) {
        part = index
      }
      if (i === parts.length - 1) {
        currentObj[part] = [...currentObj[part], defaultState]
      } else {
        currentObj = currentObj[part]
      }
    }

    setInputs(values)
    setCurrentArray(getCurrentArray(inputs, parentFieldName))
  }

  const handleRemove = (event, parentFieldName, itemIndex) => {
    event.preventDefault()
    // use regex to get the array and object path.
    const parts = parsePath(parentFieldName)

    // create a copy of the state, and get the value from the input
    const values = inputs

    // traverse the object and update the value
    let currentObj = values
    for (let i = 0; i < parts.length; i++) {
      let part = parts[i]
      // if the part can be parsed as an integer, then it is an array index
      const index = parseInt(part)
      if (!isNaN(index)) {
        part = index
      }
      if (i === parts.length - 1) {
        const currentObjValues = [...currentObj[part]]
        currentObjValues.splice(itemIndex, 1)
        currentObj[part] = currentObjValues
      } else {
        currentObj = currentObj[part]
      }
    }

    setInputs(values)
    setCurrentArray(getCurrentArray(inputs, parentFieldName))
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
        {currentArray.map((value, index) => (
          <div key={parentFieldName + '[' + index + ']'}>
            <RecursiveForm
              schema={schema?.items}
              profileData={value}
              parentFieldName={parentFieldName + '[' + index + ']'}
              isFieldRequired={isFieldRequired}
              requiredProperties={requiredProperties}
              inputs={inputs}
              setInputs={setInputs}
            />
            {index === 0 && isFieldRequired ? (
              <></>
            ) : (
              <button
                onClick={event => handleRemove(event, parentFieldName, index)}
                className="rounded-full bg-yellow-500 dark:bg-green-200 hover:bg-yellow-400 dark:hover:bg-green-100 text-white dark:text-gray-800 font-bold py-2 px-4 my-4"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          onClick={event => handleAdd(event, parentFieldName, schema)}
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
        {currentArray.map((value, index) => (
          <div key={index} className="flex justify-around items-center">
            <input
              type={schema?.items?.type === 'number' ? 'number' : 'text'}
              value={value}
              name={parentFieldName + '[' + index + ']'}
              aria-label={parentFieldName + '[' + index + ']'}
              onChange={event => handleChange(event, parentFieldName, index)}
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
                onClick={event => handleRemove(event, parentFieldName, index)}
                className="rounded-full bg-yellow-500 dark:bg-green-200 hover:bg-yellow-400 dark:hover:bg-green-100 text-white dark:text-gray-800 font-bold py-2 px-4 my-4"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          onClick={event => handleAdd(event, parentFieldName, schema)}
          className="rounded-full bg-red-500 dark:bg-purple-200 hover:bg-red-400 dark:hover:bg-purple-100 text-white dark:text-gray-800 hover:scale-110 font-bold py-2 px-4 my-4"
        >
          Add
        </button>
      </fieldset>
    )
  }
}

const getCurrentArray = (inputs, parentFieldName) => {
  // use regex to get the array and object path.
  const parts = parsePath(parentFieldName)

  let returnArray = inputs
  for (let i = 0; i < parts.length; i++) {
    let part = parts[i]
    // if the part can be parsed as an integer, then it is an array index
    const index = parseInt(part)
    if (!isNaN(index)) {
      part = index
    }
    returnArray = returnArray[part]
  }
  return returnArray
}
