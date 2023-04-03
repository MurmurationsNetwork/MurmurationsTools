import React, { useState } from 'react'
import RecursiveForm from './RecursiveForm'
import { constructState } from '../utils/constructState'

export default function ArrayField({
  schema,
  parentFieldName,
  isFieldRequired,
  requiredProperties
}) {
  const [arrayData, setArrayData] = useState([constructState(schema?.items)])

  const handleChange = (event, index) => {
    event.preventDefault()
    const values = [...arrayData]
    values[index] = event.target.value
    setArrayData(values)
    console.log('change Values', values)
  }

  const handleAdd = (event, schema) => {
    event.preventDefault()
    // use schema to construct the state
    const defaultState = constructState(schema?.items)
    const values = [...arrayData, defaultState]
    setArrayData(values)
    console.log('add Values', values)
  }

  const handleRemove = (event, index) => {
    event.preventDefault()
    const values = [...arrayData]
    values.splice(index, 1)
    setArrayData(values)
    console.log('remove Values', values)
  }

  const handleChildChange = newArrayData => {
    setArrayData(newArrayData)
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
        {arrayData.map((value, index) => (
          <div key={parentFieldName + '[' + index + ']'}>
            <RecursiveForm
              schema={schema?.items}
              parentFieldName={parentFieldName + '[' + index + ']'}
              isFieldRequired={isFieldRequired}
              requiredProperties={requiredProperties}
              arrayData={arrayData}
              arrayPath={'[' + index + ']'}
              onChildChange={handleChildChange}
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
          onClick={event => handleAdd(event, schema)}
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
        {arrayData.map((value, index) => (
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
          onClick={event => handleAdd(event, schema)}
          className="rounded-full bg-red-500 dark:bg-purple-200 hover:bg-red-400 dark:hover:bg-purple-100 text-white dark:text-gray-800 hover:scale-110 font-bold py-2 px-4 my-4"
        >
          Add
        </button>
      </fieldset>
    )
  }
}

// const getCurrentArray = (inputs, parentFieldName) => {
//   // use regex to get the array and object path.
//   const parts = parsePath(parentFieldName)
//
//   let returnArray = inputs
//   for (let i = 0; i < parts.length; i++) {
//     let part = parts[i]
//     // if the part can be parsed as an integer, then it is an array index
//     const index = parseInt(part)
//     if (!isNaN(index)) {
//       part = index
//     }
//     returnArray = returnArray[part]
//   }
//   return returnArray
// }
