import React from 'react'

export default function DefaultField({ schema, parentFieldName }) {
  return (
    <input
      type="hidden"
      defaultValue={schema.default}
      name={parentFieldName}
      aria-label={parentFieldName}
    />
  )
}
