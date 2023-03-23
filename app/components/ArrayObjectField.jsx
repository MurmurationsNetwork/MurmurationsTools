import React, { useState } from 'react'
import ArrayField from '../components/ArrayField'

export default function ArrayObjectField({
  fieldName,
  properties,
  requiredProperties
}) {
  // init empty object with properties
  let objectFields = {}
  if (properties) {
    for (let property in properties) {
      objectFields[property] = ''
    }
  }

  const [inputValues, setInputValues] = useState([objectFields])

  function handleChange(event, index, prop) {
    const values = [...inputValues]
    values[index][prop] = event.target.value
    setInputValues(values)
  }

  function handleAdd() {
    const values = [...inputValues, objectFields]
    setInputValues(values)
  }

  function handleRemove(index) {
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
                  <ArrayObjectField
                    fieldName={fieldName + '[' + index + '].' + prop}
                    properties={properties[prop]?.items?.properties}
                    requiredProperties={properties[prop]?.items?.required}
                  />
                </fieldset>
              ) : properties[prop]?.type === 'array' ? (
                <fieldset
                  className="border-dotted border-4 border-slate-300 p-4 my-4"
                  key={prop + '.' + index}
                >
                  <legend className="block text-md font-bold mt-2">
                    {properties[prop]?.title}
                  </legend>
                  <div className="text-xs">{properties[prop]?.description}</div>
                  <ArrayField
                    fieldName={fieldName + '[' + index + '].' + prop}
                    fieldType="text"
                  />
                </fieldset>
              ) : (
                <div key={prop + '.' + index}>
                  <legend className="block text-md font-bold mt-2">
                    {properties[prop]?.title}
                    {requiredProperties?.includes(prop) ? (
                      <span className="text-red-500 dark:text-red-400">*</span>
                    ) : (
                      <></>
                    )}
                  </legend>
                  <div className="flex justify-around items-center">
                    <input
                      type="text"
                      value={props[prop]}
                      name={fieldName + '[' + index + '].' + prop}
                      aria-label={fieldName + '[' + index + '].' + prop}
                      id={fieldName + '[' + index + '].' + prop}
                      onChange={event => handleChange(event, index, prop)}
                      className="form-input w-full dark:bg-slate-700 mr-2"
                    />
                  </div>
                  <span className="text-xs">
                    {properties[prop]?.description}
                  </span>
                </div>
              )
            )}
            <button
              onClick={() => handleRemove(index)}
              className="rounded-full bg-yellow-500 dark:bg-green-200 hover:bg-yellow-400 dark:hover:bg-green-100 text-white dark:text-gray-800 font-bold py-2 px-4 my-4"
            >
              Remove
            </button>
          </div>
        )
      })}
      <button
        onClick={() => handleAdd()}
        className="rounded-full bg-red-500 dark:bg-purple-200 hover:bg-red-400 dark:hover:bg-purple-100 text-white dark:text-gray-800 hover:scale-110 font-bold py-2 px-4 my-4"
      >
        Add
      </button>
    </div>
  )
}
