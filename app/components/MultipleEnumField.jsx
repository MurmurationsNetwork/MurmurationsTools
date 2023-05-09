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
      <legend className="text-md mt-4 block font-bold">
        {schema?.title}:
        {requiredProperties?.includes(parentFieldName) ? (
          <span className="text-red-500 dark:text-red-400"> *</span>
        ) : (
          <></>
        )}
      </legend>
      <div className="my-2 block text-sm">
        <select
          className="form-select mt-2 w-full text-ellipsis dark:bg-gray-700"
          aria-label={parentFieldName}
          name={parentFieldName + '[]'}
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
        <div className="mt-2 text-xs">{schema?.description}</div>
      </div>
    </div>
  )
}
