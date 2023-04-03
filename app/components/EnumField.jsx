import React, { useState } from 'react'

export default function EnumField({
  schema,
  profileData,
  parentFieldName,
  isFieldRequired,
  requiredProperties
}) {
  const [inputValue, setInputValue] = useState(profileData || '')

  const handleChange = event => {
    setInputValue(event.target.value)
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
          value={inputValue}
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
