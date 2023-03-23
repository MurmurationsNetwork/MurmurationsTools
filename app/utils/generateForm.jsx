import React from 'react'
import ArrayField from '../components/ArrayField'

export default function generateForm(schema, parentFieldName) {
  let schemaType = schema?.type
  let schemaRequired = schema?.required

  return (
    <div>
      {schemaType === 'object' && schema?.properties ? (
        Object.keys(schema?.properties)?.map(objectTitle => {
          // generate parent field name
          let currentField = parentFieldName
            ? parentFieldName + '.' + objectTitle
            : objectTitle
          if (objectTitle === 'linked_schemas') {
            return (
              <input
                type="hidden"
                name="linked_schemas"
                key="linked_schemas"
                value={schema?.metadata?.schema}
              />
            )
          } else {
            if (schema?.properties[objectTitle]?.type === 'object') {
              return (
                <div key={objectTitle}>
                  <fieldset className="border-dotted border-4 border-slate-300 p-4 my-4">
                    <legend className="block text-md font-bold mt-2">
                      {schema?.properties[objectTitle]?.title}
                      {schemaRequired?.includes(objectTitle) ? (
                        <span className="text-red-500 dark:text-red-400">
                          *
                        </span>
                      ) : (
                        <></>
                      )}
                    </legend>
                    <div className="text-xs">
                      {schema?.properties[objectTitle]?.description}
                    </div>
                    {generateForm(
                      schema?.properties[objectTitle],
                      currentField
                    )}
                  </fieldset>
                </div>
              )
            } else if (schema?.properties[objectTitle]?.type === 'array') {
              return (
                <div key={objectTitle}>
                  <fieldset className="border-dotted border-4 border-slate-300 p-4 my-4">
                    <legend className="block text-md font-bold">
                      {schema?.properties[objectTitle]?.title}
                      {schemaRequired?.includes(objectTitle) ? (
                        <span className="text-red-500 dark:text-red-400">
                          *
                        </span>
                      ) : (
                        <></>
                      )}
                    </legend>
                    {generateForm(
                      schema?.properties[objectTitle],
                      currentField
                    )}
                  </fieldset>
                </div>
              )
            } else {
              return (
                <div key={objectTitle}>
                  <legend className="block text-md font-bold mt-2">
                    {schema?.properties[objectTitle]?.title}
                    {schemaRequired?.includes(objectTitle) ? (
                      <span className="text-red-500 dark:text-red-400">*</span>
                    ) : (
                      <></>
                    )}
                  </legend>
                  {generateForm(schema?.properties[objectTitle], currentField)}
                </div>
              )
            }
          }
        })
      ) : (
        <></>
      )}
      {schemaType === 'array' ? (
        <div>
          <div className="text-xs">{schema?.description}</div>
          {schema?.items?.type === 'string' ? (
            <ArrayField fieldName={parentFieldName} fieldType="text" />
          ) : schema?.items?.type === 'number' ? (
            <ArrayField fieldName={parentFieldName} fieldType="number" />
          ) : (
            <></>
          )}
        </div>
      ) : (
        <></>
      )}
      {schemaType === 'string' || schemaType === 'number' ? (
        <div>
          <div className="block text-sm my-2">
            <label>
              <input
                className="form-input w-full dark:bg-gray-700 mt-2"
                type={schemaType === 'string' ? 'text' : 'number'}
                name={parentFieldName}
                aria-label={parentFieldName}
                min={schema?.minimum}
                max={schema?.maximum}
                minLength={schema?.minLength}
                maxLength={schema?.maxLength}
                pattern={schema?.pattern}
              />
            </label>
          </div>
          <div className="text-xs">{schema?.description}</div>
        </div>
      ) : (
        <></>
      )}
    </div>
  )
}
