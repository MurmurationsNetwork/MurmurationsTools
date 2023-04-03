import React from 'react'
import ObjectField from './ObjectField'
import TextField from './TextField'
import EnumField from './EnumField'
import DefaultField from './DefaultField'
import ArrayField from './ArrayField'

export default function RecursiveForm({
  schema,
  parentFieldName,
  isFieldRequired,
  requiredProperties,
  arrayData,
  arrayPath,
  onChildChange
}) {
  return (
    <div>
      {schema?.type === 'object' && schema?.properties ? (
        <ObjectField
          schema={schema}
          parentFieldName={parentFieldName}
          isFieldRequired={isFieldRequired}
          requiredProperties={requiredProperties}
          arrayData={arrayData}
          arrayPath={arrayPath}
          onChildChange={onChildChange}
        />
      ) : schema?.type === 'array' ? (
        <ArrayField
          schema={schema}
          parentFieldName={parentFieldName}
          isFieldRequired={isFieldRequired}
          requiredProperties={requiredProperties}
        />
      ) : schema?.default ? (
        <DefaultField schema={schema} parentFieldName={parentFieldName} />
      ) : schema?.enum ? (
        <EnumField
          schema={schema}
          parentFieldName={parentFieldName}
          isFieldRequired={isFieldRequired}
          requiredProperties={requiredProperties}
        />
      ) : schema?.type === 'string' || schema?.type === 'number' ? (
        <TextField
          schema={schema}
          parentFieldName={parentFieldName}
          isFieldRequired={isFieldRequired}
          requiredProperties={requiredProperties}
          arrayData={arrayData}
          arrayPath={arrayPath}
          onChildChange={onChildChange}
        />
      ) : (
        <></>
      )}
    </div>
  )
}
