import React from 'react'

export default function TextField({
  schema,
  profileData,
  parentFieldName,
  isFieldRequired,
  requiredProperties
}) {
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
        <input
          className="form-input w-full focus:dark:bg-gray-500 dark:bg-gray-700"
          type={schema?.type === 'string' ? 'text' : 'number'}
          defaultValue={profileData}
          name={parentFieldName}
          aria-label={parentFieldName}
          min={schema?.minimum}
          max={schema?.maximum}
          step={schema?.type === 'number' ? 'any' : null}
          minLength={schema?.minLength}
          maxLength={schema?.maxLength}
          pattern={schema?.pattern}
          required={isFieldRequired}
        />
        <div className="text-xs mt-2">{schema?.description}</div>
      </div>
    </div>
  )
}
