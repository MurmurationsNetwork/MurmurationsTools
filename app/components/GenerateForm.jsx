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
            <RecursiveForm
              schema={schema?.properties[property]}
              profileData={profileData?.[property]}
              parentFieldName={property}
              isFieldRequired={!!schema?.required?.includes(property)}
              requiredProperties={schema?.required}
            />
          </div>
        )
      }
    })
  } else {
    return <></>
  }
}
