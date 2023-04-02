import React from 'react'
import RecursiveForm from './RecursiveForm'

export default function ObjectField({
  schema,
  profileData,
  parentFieldName,
  isFieldRequired,
  requiredProperties,
  inputs,
  setInputs
}) {
  return Object.keys(schema?.properties)?.map(property => {
    if (
      schema?.properties[property]?.type === 'string' ||
      schema?.properties[property]?.type === 'number' ||
      schema?.properties[property]?.type === 'array'
    ) {
      return (
        <div key={parentFieldName + '.' + property}>
          <RecursiveForm
            schema={schema?.properties[property]}
            profileData={profileData?.[property]}
            parentFieldName={parentFieldName + '.' + property}
            isFieldRequired={
              isFieldRequired
                ? !!schema?.required?.includes(property)
                : isFieldRequired
            }
            requiredProperties={schema?.required}
            inputs={inputs}
            setInputs={setInputs}
          />
        </div>
      )
    } else if (schema?.properties[property]?.properties) {
      return (
        <div key={parentFieldName + '.' + property}>
          <fieldset className="border-dotted border-4 border-slate-300 p-4 my-4">
            <legend className="block text-md font-bold mt-2">
              {schema?.properties[property]?.title}
              {requiredProperties?.includes(property) ? (
                <span className="text-red-500 dark:text-red-400"> *</span>
              ) : (
                <></>
              )}
            </legend>
            <div className="text-xs">
              {schema?.properties[property]?.description}
            </div>
            <RecursiveForm
              schema={schema?.properties[property]}
              profileData={profileData?.[property]}
              parentFieldName={parentFieldName + '.' + property}
              isFieldRequired={
                isFieldRequired
                  ? !!schema?.required?.includes(property)
                  : isFieldRequired
              }
              requiredProperties={schema?.required}
              inputs={inputs}
              setInputs={setInputs}
            />
          </fieldset>
        </div>
      )
    } else {
      return <div key={parentFieldName + '.' + property}></div>
    }
  })
}
