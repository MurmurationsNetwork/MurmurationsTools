import React, { useState } from 'react'
import ArrayField from '../components/ArrayField'
import ObjectField from '../components/ObjectField'

export default function ArrayObjectField({
  fieldName,
  properties,
  requiredProperties,
  isFieldRequired,
  profileData
}) {
  // init empty object with properties
  let objectFields = {}
  if (properties) {
    for (let property in properties) {
      objectFields[property] = profileData?.[property] || ''
    }
  }

  let defaultState = [objectFields]
  if (profileData) {
    defaultState = profileData
  }

  const [inputValues, setInputValues] = useState(defaultState)

  function handleChange(event, index, prop) {
    const values = [...inputValues]
    values[index][prop] = event.target.value
    setInputValues(values)
  }

  function handleAdd(event) {
    event.preventDefault()
    const values = [...inputValues, objectFields]
    setInputValues(values)
  }

  function handleRemove(event, index) {
    event.preventDefault()
    const values = [...inputValues]
    values.splice(index, 1)
    setInputValues(values)
  }

  return (
    <div>
      {inputValues?.map((props, index) => {
        return (
          <div key={fieldName + '.' + index}>
            {Object?.keys(props)?.map(prop =>
              properties[prop]?.type === 'array' &&
              properties[prop]?.items?.type === 'object' ? (
                <fieldset
                  className="border-dotted border-4 border-slate-300 p-4 my-4"
                  key={prop + '.' + index}
                >
                  <legend className="block text-md font-bold mt-2">
                    {properties[prop]?.title}
                    {requiredProperties?.includes(prop) ? (
                      <span className="text-red-500 dark:text-red-400"> *</span>
                    ) : (
                      <></>
                    )}
                  </legend>
                  <div className="text-xs">{properties[prop]?.description}</div>
                  <ArrayObjectField
                    fieldName={fieldName + '[' + index + '].' + prop}
                    properties={properties[prop]?.items?.properties}
                    requiredProperties={properties[prop]?.items?.required}
                    isFieldRequired={
                      isFieldRequired
                        ? !!requiredProperties?.includes(prop)
                        : isFieldRequired
                    }
                    profileData={props[prop]}
                  />
                </fieldset>
              ) : properties[prop]?.type === 'array' ? (
                <fieldset
                  className="border-dotted border-4 border-slate-300 p-4 my-4"
                  key={prop + '.' + index}
                >
                  <legend className="block text-md font-bold mt-2">
                    {properties[prop]?.title}
                    {requiredProperties?.includes(prop) ? (
                      <span className="text-red-500 dark:text-red-400"> *</span>
                    ) : (
                      <></>
                    )}
                  </legend>
                  <div className="text-xs">{properties[prop]?.description}</div>
                  <ArrayField
                    schema={properties[prop]}
                    fieldName={fieldName + '[' + index + '].' + prop}
                    fieldType={properties[prop]?.type}
                    isFieldRequired={
                      isFieldRequired
                        ? !!requiredProperties?.includes(prop)
                        : isFieldRequired
                    }
                    profileData={props[prop]}
                  />
                </fieldset>
              ) : properties[prop]?.type === 'object' &&
                properties[prop]?.properties ? (
                <fieldset
                  className="border-dotted border-4 border-slate-300 p-4 my-4"
                  key={prop + '.' + index}
                >
                  <legend className="block text-md font-bold mt-2">
                    {properties[prop]?.title}
                    {requiredProperties?.includes(prop) ? (
                      <span className="text-red-500 dark:text-red-400"> *</span>
                    ) : (
                      <></>
                    )}
                  </legend>
                  <div className="text-xs">{properties[prop]?.description}</div>
                  <ObjectField
                    fieldName={fieldName + '[' + index + '].' + prop}
                    properties={properties[prop]?.properties}
                    requiredProperties={properties[prop]?.required}
                    isFieldRequired={
                      isFieldRequired
                        ? !!requiredProperties?.includes(prop)
                        : isFieldRequired
                    }
                    profileData={props[prop]}
                  />
                </fieldset>
              ) : properties[prop]?.enum ? (
                <div key={prop + '.' + index}>
                  <legend className="block text-md font-bold mt-2">
                    {properties[prop]?.title}:
                    {requiredProperties?.includes(prop) ? (
                      <span className="text-red-500 dark:text-red-400"> *</span>
                    ) : (
                      <></>
                    )}
                  </legend>
                  <div className="block text-sm my-2">
                    <label>
                      <select
                        className="form-select w-full dark:bg-gray-700 mt-2 text-ellipsis"
                        aria-label={fieldName + '[' + index + '].' + prop}
                        name={fieldName + '[' + index + '].' + prop}
                        multiple={properties[prop]?.multi}
                        required={isFieldRequired}
                        defaultValue={props[prop]}
                      >
                        {properties[prop]?.multi ? null : (
                          <option value="" key="0"></option>
                        )}
                        {properties[prop]?.enum?.map((item, index) => (
                          <option value={item} key={item}>
                            {properties[prop]?.enumNames
                              ? properties[prop]?.enumNames?.[index]
                              : item}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="text-xs">{properties[prop]?.description}</div>
                </div>
              ) : properties[prop]?.type === 'string' ||
                properties[prop]?.type === 'number' ? (
                <div key={prop + '.' + index}>
                  <legend className="block text-md font-bold mt-2">
                    {properties[prop]?.title}:
                    {requiredProperties?.includes(prop) ? (
                      <span className="text-red-500 dark:text-red-400"> *</span>
                    ) : (
                      <></>
                    )}
                  </legend>
                  <div className="flex justify-around items-center">
                    <input
                      type={
                        properties[prop]?.type === 'string' ? 'text' : 'number'
                      }
                      defaultValue={props[prop]}
                      name={fieldName + '[' + index + '].' + prop}
                      aria-label={fieldName + '[' + index + '].' + prop}
                      id={fieldName + '[' + index + '].' + prop}
                      onChange={event => handleChange(event, index, prop)}
                      className="form-input w-full focus:dark:bg-gray-500 dark:bg-gray-700 mr-2 mt-2"
                      required={
                        isFieldRequired
                          ? !!requiredProperties?.includes(prop)
                          : isFieldRequired
                      }
                      min={properties[prop]?.minimum}
                      max={properties[prop]?.maximum}
                      minLength={properties[prop]?.minLength}
                      maxLength={properties[prop]?.maxLength}
                      pattern={properties[prop]?.pattern}
                    />
                  </div>
                  <span className="text-xs">
                    {properties[prop]?.description}
                  </span>
                </div>
              ) : (
                <div key={prop + '.' + index}></div>
              )
            )}
            <button
              onClick={event => handleRemove(event, index)}
              className="rounded-full bg-yellow-500 dark:bg-green-200 hover:bg-yellow-400 dark:hover:bg-green-100 text-white dark:text-gray-800 font-bold py-2 px-4 my-4"
            >
              Remove
            </button>
          </div>
        )
      })}
      <button
        onClick={event => handleAdd(event)}
        className="rounded-full bg-red-500 dark:bg-purple-200 hover:bg-red-400 dark:hover:bg-purple-100 text-white dark:text-gray-800 hover:scale-110 font-bold py-2 px-4 my-4"
      >
        Add
      </button>
    </div>
  )
}
