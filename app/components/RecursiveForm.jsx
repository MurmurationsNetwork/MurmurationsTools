import React from 'react'
import ObjectField from './ObjectField'
import TextField from './TextField'
import DefaultField from './DefaultField'
import ArrayField from './ArrayField'
import MultipleEnumField from './MultipleEnumField'

/*
 ================================
 Recursive form is used for rendering the content according to the schema type. If the schema has child content, it will come to this component and render the child content.
 ================================
 * There are 4 types of schema: object, array, default, enum and text
 * 1. object: If the object schema has properties, it will render the ObjectField component.
 * 2. array: If the array schema has enum items, it will render the MultipleEnumField component (multiple select input). Otherwise, it will render the ArrayField component.
 * 3. default: If the schema has default value, it will render the DefaultField component (hidden input with default value).
 * 4. enum and text: enum and text has the same state, so they are merged. If the schema has enum, it will render the select input. If the schema type is string or number, it will render the text input.
 * For other cases, it will render nothing.
 */

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
      ) : schema?.enum ||
        schema?.type === 'string' ||
        schema?.type === 'number' ? (
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
