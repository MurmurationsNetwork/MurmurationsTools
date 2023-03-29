import ArrayField from '../components/ArrayField'
import ArrayObjectField from '../components/ArrayObjectField'
import React from 'react'

export default function ObjectField({
  fieldName,
  properties,
  requiredProperties,
  isFieldRequired,
  profileData
}) {
  return (
    <div>
      {Object?.keys(properties)?.map(prop => {
        return properties[prop]?.type === 'array' &&
          properties[prop]?.items?.type === 'object' ? (
          <fieldset
            className="border-dotted border-4 border-slate-300 p-4 my-4"
            key={prop}
          >
            <legend className="block text-md font-bold mt-2">
              {properties[prop]?.title}
              {requiredProperties?.includes(prop) ? (
                <span className="text-red-500 dark:text-red-400"> *</span>
              ) : (
                <></>
              )}
            </legend>
            <div className="text-xs">{properties[prop]?.description}</div>
            <ArrayObjectField
              fieldName={fieldName + '.' + prop}
              properties={properties[prop]?.items?.properties}
              requiredProperties={properties[prop]?.items?.required}
              isFieldRequired={
                isFieldRequired
                  ? !!requiredProperties?.includes(prop)
                  : isFieldRequired
              }
              profileData={properties[prop]}
            />
          </fieldset>
        ) : properties[prop]?.type === 'array' ? (
          <fieldset
            className="border-dotted border-4 border-slate-300 p-4 my-4"
            key={prop}
          >
            <legend className="block text-md font-bold mt-2">
              {properties[prop]?.title}
              {requiredProperties?.includes(prop) ? (
                <span className="text-red-500 dark:text-red-400"> *</span>
              ) : (
                <></>
              )}
            </legend>
            <div className="text-xs">{properties[prop]?.description}</div>
            <ArrayField
              schema={properties[prop]}
              fieldName={fieldName + '.' + prop}
              fieldType={properties[prop]?.type}
              isFieldRequired={
                isFieldRequired
                  ? !!requiredProperties?.includes(prop)
                  : isFieldRequired
              }
              profileData={properties[prop]}
            />
          </fieldset>
        ) : properties[prop]?.type === 'object' ? (
          <fieldset
            className="border-dotted border-4 border-slate-300 p-4 my-4"
            key={prop}
          >
            <legend className="block text-md font-bold mt-2">
              {properties[prop]?.title}
              {requiredProperties?.includes(prop) ? (
                <span className="text-red-500 dark:text-red-400"> *</span>
              ) : (
                <></>
              )}
            </legend>
            <div className="text-xs">{properties[prop]?.description}</div>
            <ObjectField
              fieldName={fieldName + '.' + prop}
              properties={properties[prop]?.properties}
              requiredProperties={properties[prop]?.required}
              isFieldRequired={
                isFieldRequired
                  ? !!requiredProperties?.includes(prop)
                  : isFieldRequired
              }
              profileData={properties[prop]}
            />
          </fieldset>
        ) : properties[prop]?.enum ? (
          <div key={prop}>
            <legend className="block text-md font-bold mt-2">
              {properties[prop]?.title}:
              {requiredProperties?.includes(prop) ? (
                <span className="text-red-500 dark:text-red-400"> *</span>
              ) : (
                <></>
              )}
            </legend>
            <div className="block text-sm my-2">
              <label>
                <select
                  className="form-select w-full dark:bg-gray-700 mt-2 text-ellipsis"
                  aria-label={fieldName + '.' + prop}
                  name={fieldName + '.' + prop}
                  multiple={properties[prop]?.multi}
                  required={isFieldRequired}
                  defaultValue={profileData[prop]}
                >
                  {properties[prop]?.multi ? null : (
                    <option value="" key="0"></option>
                  )}
                  {properties[prop]?.enum?.map((item, index) => (
                    <option value={item} key={item}>
                      {properties[prop]?.enumNames
                        ? properties[prop]?.enumNames?.[index]
                        : item}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="text-xs">{properties[prop]?.description}</div>
          </div>
        ) : properties[prop]?.type === 'string' ||
          properties[prop]?.type === 'number' ? (
          <div key={prop}>
            <legend className="block text-md font-bold mt-2">
              {properties[prop]?.title}:
              {requiredProperties?.includes(prop) ? (
                <span className="text-red-500 dark:text-red-400"> *</span>
              ) : (
                <></>
              )}
            </legend>
            <div className="flex justify-around items-center">
              <input
                type={properties[prop]?.type === 'string' ? 'text' : 'number'}
                defaultValue={profileData[prop]}
                name={fieldName + '.' + prop}
                aria-label={fieldName + '.' + prop}
                id={fieldName + '.' + prop}
                className="form-input w-full focus:dark:bg-gray-500 dark:bg-gray-700 mr-2 mt-2"
                required={
                  isFieldRequired
                    ? !!requiredProperties?.includes(prop)
                    : isFieldRequired
                }
                min={properties[prop]?.minimum}
                max={properties[prop]?.maximum}
                step={properties[prop]?.type === 'number' ? 'any' : null}
                minLength={properties[prop]?.minLength}
                maxLength={properties[prop]?.maxLength}
                pattern={properties[prop]?.pattern}
              />
            </div>
            <span className="text-xs">{properties[prop]?.description}</span>
          </div>
        ) : (
          <div key={prop}></div>
        )
      })}
    </div>
  )
}
