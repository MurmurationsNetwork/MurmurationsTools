import React from 'react'
import RecursiveForm from './RecursiveForm'
import SchemaField from './SchemaField'

export default function GenerateForm({ schema, profileData }) {
  if (schema?.properties) {
    return Object.keys(schema?.properties)?.map(property => {
      if (property === 'linked_schemas') {
        return (
          <div key={property}>
            <SchemaField schema={schema} />
          </div>
        )
      } else {
        return (
          <div key={property}>
            {schema?.properties[property]?.type === 'object' ? (
              <fieldset className="border-dotted border-4 border-slate-300 p-4 my-4">
                <legend className="block text-md font-bold mt-2">
                  {schema?.properties[property]?.title}
                  {schema?.required?.includes(property) ? (
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
                  parentFieldName={property}
                  isFieldRequired={!!schema?.required?.includes(property)}
                  requiredProperties={schema?.required}
                />
              </fieldset>
            ) : (
              <RecursiveForm
                schema={schema?.properties[property]}
                parentFieldName={property}
                isFieldRequired={!!schema?.required?.includes(property)}
                requiredProperties={schema?.required}
              />
            )}
          </div>
        )
      }
    })
  } else {
    return <></>
  }
}
