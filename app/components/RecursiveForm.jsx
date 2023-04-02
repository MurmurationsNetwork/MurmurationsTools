import React from 'react'
import ObjectField from './ObjectField'
import TextField from './TextField'
import EnumField from './EnumField'
import DefaultField from './DefaultField'
import ArrayField from './ArrayField'

export default function RecursiveForm({
  schema,
  profileData,
  parentFieldName,
  isFieldRequired,
  requiredProperties,
  inputs,
  setInputs
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
          inputs={inputs}
          setInputs={setInputs}
        />
      ) : schema?.type === 'array' ? (
        <ArrayField
          schema={schema}
          profileData={profileData}
          parentFieldName={parentFieldName}
          isFieldRequired={isFieldRequired}
          requiredProperties={requiredProperties}
          inputs={inputs}
          setInputs={setInputs}
        />
      ) : schema?.default ? (
        <DefaultField schema={schema} parentFieldName={parentFieldName} />
      ) : schema?.enum ? (
        <EnumField
          schema={schema}
          profileData={profileData}
          parentFieldName={parentFieldName}
          isFieldRequired={isFieldRequired}
          requiredProperties={requiredProperties}
          inputs={inputs}
          setInputs={setInputs}
        />
      ) : schema?.type === 'string' || schema?.type === 'number' ? (
        <TextField
          schema={schema}
          profileData={profileData}
          parentFieldName={parentFieldName}
          isFieldRequired={isFieldRequired}
          requiredProperties={requiredProperties}
          inputs={inputs}
          setInputs={setInputs}
        />
      ) : (
        <></>
      )}
    </div>
  )
}
