import React, { useState } from 'react'
import { getCurrentValue } from './utils/getCurrentValue'
import { generateNewState } from './utils/generateNewState'

export default function MultipleEnumField({
  schema,
  profileData,
  parentFieldName,
  isFieldRequired,
  requiredProperties,
  arrayData,
  arrayPath,
  onChildChange
}) {
  const [inputValue, setInputValue] = useState(profileData || [])

  const handleChange = event => {
    // Get the selected values
    const { options } = event.target
    const selectedValues = []
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value)
      }
    }

    // If the field is inherited from the parent, we need to update the parent.
    // Otherwise, we can just update the local state.
    if (arrayData && arrayPath) {
      const newArray = generateNewState(arrayData, arrayPath, selectedValues)
      onChildChange(newArray)
    } else {
      setInputValue(selectedValues)
    }
  }

  // If the field is inherited from the parent, we need to get the "value" from the parent.
  // Otherwise, we can just use the local state.
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
          value={arrayData ? getCurrentValue(arrayData, arrayPath) : inputValue}
          onChange={event => handleChange(event)}
          multiple={true}
        >
          {schema?.items?.enum?.map((item, index) => (
            <option value={item} key={item}>
              {schema?.items?.enumNames
                ? schema?.items?.enumNames?.[index]
                : item}
            </option>
          ))}
        </select>
        <div className="text-xs mt-2">{schema?.description}</div>
      </div>
    </div>
  )
}
