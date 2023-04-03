import React, { useState } from 'react'
import { parsePath } from '../utils/parsePath'

export default function EnumField({
  schema,
  profileData,
  parentFieldName,
  isFieldRequired,
  requiredProperties,
  arrayData,
  arrayPath,
  onChildChange
}) {
  const [inputValue, setInputValue] = useState(profileData || '')

  const handleChange = event => {
    if (arrayData && arrayPath) {
      const newArray = [...arrayData]
      let values = newArray
      const parts = parsePath(arrayPath)
      for (let i = 0; i < parts.length; i++) {
        let part = parts[i]
        const index = parseInt(part)
        if (!isNaN(index)) {
          part = index
        }
        if (i === parts.length - 1) {
          values[part] = event.target.value
        } else {
          values = values[part]
        }
      }
      onChildChange(newArray)
    } else {
      setInputValue(event.target.value)
    }
  }

  const getValue = (arrayData, arrayPath) => {
    if (arrayData && arrayPath) {
      let result = arrayData
      const parts = parsePath(arrayPath)
      for (let part of parts) {
        const index = parseInt(part)
        if (!isNaN(index)) {
          part = index
        }
        result = result[part]
      }
      return result
    } else {
      return ''
    }
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
          value={arrayData ? getValue(arrayData, arrayPath) : inputValue}
          onChange={event => handleChange(event)}
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
