import React from 'react'
import RecursiveForm from './RecursiveForm'

export default function ObjectField({
  schema,
  profileData,
  parentFieldName,
  isFieldRequired,
  requiredProperties,
  arrayData,
  arrayPath,
  onChildChange
}) {
  /*
   * This component check the children of the object.
   * If they are string, number, array, we won't generate the object border.
   * If they are objects, we will generate the object border.
   * For other cases, it will render nothing. (This should not happen)
   */
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
            arrayData={arrayData}
            arrayPath={arrayPath + '.' + property}
            onChildChange={onChildChange}
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
              arrayData={arrayData}
              arrayPath={arrayPath + '.' + property}
              onChildChange={onChildChange}
            />
          </fieldset>
        </div>
      )
    } else {
      return <div key={parentFieldName + '.' + property}></div>
    }
  })
}
