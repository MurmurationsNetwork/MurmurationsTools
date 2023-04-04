import React, { useEffect, useState } from 'react'
import RecursiveForm from './RecursiveForm'
import { constructState } from '../utils/constructState'
import { parsePath } from '../utils/parsePath'

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
  const [arrayData, setArrayData] = useState(
    profileData ? profileData : [constructState(schema?.items)]
  )

  useEffect(() => {
    if (parentArrayData && parentArrayPath) {
      let currentArray = parentArrayData
      // parse array
      const parts = parsePath(parentArrayPath)
      for (let i = 0; i < parts.length; i++) {
        let part = parts[i]
        const index = parseInt(part)
        if (!isNaN(index)) {
          part = index
        }
        currentArray = currentArray[part]
      }

      // if the current array is different from the parent array, update the state
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
    // use schema to construct the state
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

  const handleChildChange = newArrayData => {
    setArrayData(newArrayData)
  }

  const updateParentArray = newChildArray => {
    const newArray = [...parentArrayData]
    let values = newArray
    const parts = parsePath(parentArrayPath)
    for (let i = 0; i < parts.length; i++) {
      let part = parts[i]
      const index = parseInt(part)
      if (!isNaN(index)) {
        part = index
      }
      if (i === parts.length - 1) {
        values[part] = newChildArray
      } else {
        values = values[part]
      }
    }
    parentOnChildChange(newArray)
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
        <div className="block text-sm mb-4">{schema?.description}</div>
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
        <div className="block text-sm mb-4">{schema?.description}</div>
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
