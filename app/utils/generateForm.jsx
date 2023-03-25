import React from 'react'
import ArrayField from '../components/ArrayField'
import ArrayObjectField from '../components/ArrayObjectField'

export default function generateForm(
  schema,
  profileData,
  parentFieldName,
  isFieldRequired
) {
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
                          {' '}*
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
                      profileData?.[objectTitle],
                      currentField,
                      isFieldRequired
                        ? !!schemaRequired?.includes(objectTitle)
                        : isFieldRequired
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
                          {' '}*
                        </span>
                      ) : (
                        <></>
                      )}
                    </legend>
                    {generateForm(
                      schema?.properties[objectTitle],
                      profileData?.[objectTitle],
                      currentField,
                      isFieldRequired
                        ? !!schemaRequired?.includes(objectTitle)
                        : isFieldRequired
                    )}
                  </fieldset>
                </div>
              )
            } else {
              return (
                <div key={objectTitle}>
                  <legend className="block text-md font-bold mt-4">
                    {schema?.properties[objectTitle]?.title}:
                    {schemaRequired?.includes(objectTitle) ? (
                      <span className="text-red-500 dark:text-red-400">{' '}*</span>
                    ) : (
                      <></>
                    )}
                  </legend>
                  {generateForm(
                    schema?.properties[objectTitle],
                    profileData?.[objectTitle],
                    currentField,
                    !!schemaRequired?.includes(objectTitle) && !parentFieldName
                  )}
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
            <ArrayField
              schema={schema}
              fieldName={parentFieldName}
              fieldType="text"
              isFieldRequired={isFieldRequired}
              profileData={profileData}
            />
          ) : schema?.items?.type === 'number' ? (
            <ArrayField
              schema={schema}
              fieldName={parentFieldName}
              fieldType="number"
              isFieldRequired={isFieldRequired}
              profileData={profileData}
            />
          ) : schema?.items?.type === 'object' ? (
            <ArrayObjectField
              fieldName={parentFieldName}
              properties={schema?.items?.properties}
              requiredProperties={schema?.items?.required}
              isFieldRequired={isFieldRequired}
              profileData={profileData}
            />
          ) : (
            <></>
          )}
        </div>
      ) : (
        <></>
      )}
      {schemaType === 'string' || schemaType === 'number' ? (
        schema?.enum ? (
          <div>
            <div className="block text-sm my-2">
              <label>
                <select
                  className="form-select w-full dark:bg-gray-700 mt-2 text-ellipsis"
                  aria-label={parentFieldName}
                  name={parentFieldName}
                  multiple={schema?.multi}
                  required={isFieldRequired}
                  defaultValue={profileData}
                >
                  {schema?.multi ? null : <option value="" key="0"></option>}
                  {schema?.enum?.map((item, index) => (
                    <option value={item} key={item}>
                      {schema?.enumNames ? schema?.enumNames?.[index] : item}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="text-xs">{schema?.description}</div>
          </div>
        ) : (
          <div>
            <div className="block text-sm my-2">
              <label>
                <input
                  className="form-input w-full dark:bg-gray-700"
                  type={schemaType === 'string' ? 'text' : 'number'}
                  defaultValue={profileData}
                  name={parentFieldName}
                  aria-label={parentFieldName}
                  min={schema?.minimum}
                  max={schema?.maximum}
                  minLength={schema?.minLength}
                  maxLength={schema?.maxLength}
                  pattern={schema?.pattern}
                  required={isFieldRequired}
                />
              </label>
            </div>
            <div className="text-xs">{schema?.description}</div>
          </div>
        )
      ) : (
        <></>
      )}
    </div>
  )
}
