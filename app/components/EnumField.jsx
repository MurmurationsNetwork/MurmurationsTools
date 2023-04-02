import React from 'react'
import { parsePath } from '../utils/parsePath'

export default function EnumField({
  schema,
  profileData,
  parentFieldName,
  isFieldRequired,
  requiredProperties,
  inputs,
  setInputs
}) {
  // handle the change event from the input and change the state in the parent component
  const handleChange = (event, parentFieldName) => {
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
        currentObj[part] = value
      } else {
        currentObj = currentObj[part]
      }
    }

    setInputs(values)
  }

  return (
    <div>
      <legend className="block text-md font-bold mt-4">
        {schema?.title}:
        {requiredProperties?.includes(parentFieldName) ? (
          <span className="text-red-500 dark:text-red-400"> *</span>
        ) : (
          <></>
        )}
      </legend>
      <div className="block text-sm my-2">
        <select
          className="form-select w-full dark:bg-gray-700 mt-2 text-ellipsis"
          aria-label={parentFieldName}
          name={parentFieldName}
          required={isFieldRequired}
          defaultValue={profileData}
          onChange={event => handleChange(event, parentFieldName)}
        >
          <option value="" key="0"></option>
          {schema?.enum?.map((item, index) => (
            <option value={item} key={item}>
              {schema?.enumNames ? schema?.enumNames?.[index] : item}
            </option>
          ))}
        </select>
        <div className="text-xs mt-2">{schema?.description}</div>
      </div>
    </div>
  )
}
