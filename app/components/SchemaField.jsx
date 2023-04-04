import React from 'react'

export default function SchemaField({ schema }) {
  return (
    <input
      type="hidden"
      name="linked_schemas"
      key="linked_schemas"
      value={schema?.metadata?.schema}
    />
  )
}
