import React from 'react'
import RecursiveForm from './RecursiveForm'
import SchemaField from './SchemaField'

export default function GenerateForm({ schema, profileData }) {
  // The top level of schemas are always objects, if not, return nothing
  if (schema?.properties) {
    return Object.keys(schema?.properties)?.map(property => {
      // link_schemas is a special case, we want to render it as a hidden input
      if (property === 'linked_schemas') {
        return (
          <div key={property}>
            <SchemaField schema={schema} />
          </div>
        )
      } else {
        // if the property is an object with properties, we want to render the border with title and description
        return (
          <div key={property}>
            {schema?.properties[property]?.type === 'object' &&
            schema?.properties[property]?.properties ? (
              <fieldset className="my-4 border-4 border-dotted border-slate-300 p-4">
                <legend className="text-md mt-2 block font-bold">
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
                  profileData={profileData?.[property]}
                  parentFieldName={property}
                  isFieldRequired={!!schema?.required?.includes(property)}
                  requiredProperties={schema?.required}
                />
              </fieldset>
            ) : (
              <RecursiveForm
                schema={schema?.properties[property]}
                profileData={profileData?.[property]}
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
