import React, { useEffect, useState } from 'react'
import RecursiveForm from './RecursiveForm'
import { constructState } from './utils/constructState'
import { generateNewState } from './utils/generateNewState'
import { getCurrentValue } from './utils/getCurrentValue'

export default function ArrayField({
  schema,
  profileData,
  parentFieldName,
  isFieldRequired,
  requiredProperties,
  parentArrayData,
  parentArrayPath,
  parentOnChildChange
}) {
  // if the parent didn't provide profileData, we need to construct the state first
  const [arrayData, setArrayData] = useState(
    profileData ? profileData : [constructState(schema?.items)]
  )

  useEffect(() => {
    if (parentArrayData && parentArrayPath) {
      let currentArray = getCurrentValue(parentArrayData, parentArrayPath)

      // If the current array is different from the parent array, update the state
      if (currentArray !== arrayData) {
        setArrayData(currentArray)
      }
    }
  }, [parentArrayData, parentArrayPath, arrayData])

  const handleChange = (event, index) => {
    event.preventDefault()
    const values = [...arrayData]
    values[index] = event.target.value
    setArrayData(values)

    // if we have a parent array, we need to update it
    if (parentArrayData && parentArrayPath) {
      updateParentArray(values)
    }
  }

  const handleAdd = (event, schema) => {
    event.preventDefault()
    // use schema to construct the new state
    const defaultState = constructState(schema?.items)
    const values = [...arrayData, defaultState]
    setArrayData(values)

    // if we have a parent array, we need to update it
    if (parentArrayData && parentArrayPath) {
      updateParentArray(values)
    }
  }

  const handleRemove = (event, index) => {
    event.preventDefault()
    const values = [...arrayData]
    values.splice(index, 1)
    setArrayData(values)

    // if we have a parent array, we need to update it
    if (parentArrayData && parentArrayPath) {
      updateParentArray(values)
    }
  }

  // If the child component changes, it will notify here to update the current array
  const handleChildChange = newArrayData => {
    setArrayData(newArrayData)
  }

  // For the array field that is nested in another array, we need to update the parent array
  const updateParentArray = newChildArray => {
    const newArray = generateNewState(
      parentArrayData,
      parentArrayPath,
      newChildArray
    )
    parentOnChildChange(newArray)
  }

  // If the children type is object, it will render the object border
  // If the children type is text or number, it will render a list of inputs
  // todo: if the children type is array, it will render a list of array fields
  // Otherwise, it will render nothing
  if (schema?.items?.type === 'object') {
    return (
      <fieldset className="my-4 border-4 border-dotted border-slate-300 p-4">
        <legend className="text-md block font-bold">
          {schema?.title}
          {requiredProperties?.includes(parentFieldName) ? (
            <span className="text-red-500 dark:text-red-400"> *</span>
          ) : (
            <></>
          )}
        </legend>
        <div className="mb-4 block text-sm">{schema?.description}</div>
        {arrayData.map((value, index) => (
          <div key={parentFieldName + '[' + index + ']'}>
            <RecursiveForm
              schema={schema?.items}
              profileData={value}
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
                className="my-4 rounded-full bg-yellow-500 px-4 py-2 font-bold text-white hover:bg-yellow-400 dark:bg-green-200 dark:text-gray-800 dark:hover:bg-green-100"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          onClick={event => handleAdd(event, schema)}
          className="my-4 rounded-full bg-red-500 px-4 py-2 font-bold text-white hover:scale-110 hover:bg-red-400 dark:bg-purple-200 dark:text-gray-800 dark:hover:bg-purple-100"
        >
          Add
        </button>
      </fieldset>
    )
  } else if (
    schema?.items?.type === 'string' ||
    schema?.items?.type === 'number'
  ) {
    return (
      <fieldset className="my-4 border-4 border-dotted border-slate-300 p-4">
        <legend className="text-md block font-bold">
          {schema?.title}
          {requiredProperties?.includes(parentFieldName) ? (
            <span className="text-red-500 dark:text-red-400"> *</span>
          ) : (
            <></>
          )}
        </legend>
        <div className="mb-4 block text-sm">{schema?.description}</div>
        {arrayData.map((value, index) => (
          <div key={index} className="flex items-center justify-around">
            <input
              type={schema?.items?.type === 'number' ? 'number' : 'text'}
              value={value}
              name={parentFieldName + '[' + index + ']'}
              aria-label={parentFieldName + '[' + index + ']'}
              onChange={event => handleChange(event, index)}
              className="form-input mr-2 w-full dark:bg-gray-700 focus:dark:bg-gray-500"
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
                className="my-4 rounded-full bg-yellow-500 px-4 py-2 font-bold text-white hover:bg-yellow-400 dark:bg-green-200 dark:text-gray-800 dark:hover:bg-green-100"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          onClick={event => handleAdd(event, schema)}
          className="my-4 rounded-full bg-red-500 px-4 py-2 font-bold text-white hover:scale-110 hover:bg-red-400 dark:bg-purple-200 dark:text-gray-800 dark:hover:bg-purple-100"
        >
          Add
        </button>
      </fieldset>
    )
  } else {
    return <></>
  }
}
