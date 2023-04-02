import React, { useState } from 'react'
import RecursiveForm from './RecursiveForm'
import SchemaField from './SchemaField'
import { constructState } from '../utils/constructState'

export default function GenerateForm({ schema, profileData }) {
  // using schema to construct the state
  const defaultState = constructState(schema)
  const [inputs, setInputs] = useState(defaultState)

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
              inputs={inputs}
              setInputs={setInputs}
            />
          </div>
        )
      }
    })
  } else {
    return <></>
  }
}
