import React from 'react'
import ObjectField from './ObjectField'
import TextField from './TextField'
import EnumField from './EnumField'
import DefaultField from './DefaultField'
import ArrayField from './ArrayField'
import MultipleEnumField from './MultipleEnumField'

export default function RecursiveForm({
  schema,
  profileData,
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
          profileData={profileData}
          parentFieldName={parentFieldName}
          isFieldRequired={isFieldRequired}
          requiredProperties={requiredProperties}
          arrayData={arrayData}
          arrayPath={arrayPath}
          onChildChange={onChildChange}
        />
      ) : schema?.type === 'array' ? (
        schema?.items?.enum ? (
          <MultipleEnumField
            schema={schema}
            profileData={profileData}
            parentFieldName={parentFieldName}
            isFieldRequired={isFieldRequired}
            requiredProperties={requiredProperties}
            arrayData={arrayData}
            arrayPath={arrayPath}
            onChildChange={onChildChange}
          />
        ) : (
          <ArrayField
            schema={schema}
            profileData={profileData}
            parentFieldName={parentFieldName}
            isFieldRequired={isFieldRequired}
            requiredProperties={requiredProperties}
            parentArrayData={arrayData}
            parentArrayPath={arrayPath}
            parentOnChildChange={onChildChange}
          />
        )
      ) : schema?.default ? (
        <DefaultField schema={schema} parentFieldName={parentFieldName} />
      ) : schema?.enum ? (
        <EnumField
          schema={schema}
          profileData={profileData}
          parentFieldName={parentFieldName}
          isFieldRequired={isFieldRequired}
          requiredProperties={requiredProperties}
          arrayData={arrayData}
          arrayPath={arrayPath}
          onChildChange={onChildChange}
        />
      ) : schema?.type === 'string' || schema?.type === 'number' ? (
        <TextField
          schema={schema}
          profileData={profileData}
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
