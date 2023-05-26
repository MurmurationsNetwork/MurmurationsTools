import { generateSchemaInstance } from '@murmurations/jsig'

export default function generateInstanceServer(schema, data) {
  return generateSchemaInstance(schema, data)
}
