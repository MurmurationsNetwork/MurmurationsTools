import { parsePath } from './parsePath'

/*
 * Generate a new state based on the array data and the array path
 * @param {Array} arrayData - The parent array data
 * @param {String} arrayPath - The current state path of the array
 * @param {Array}/{String}/{Integer} values - The value of current state, replace it for updating the parent state
 * @returns {Array} - The new parent array data
 */
export const generateNewState = (arrayData, arrayPath, values) => {
  const newArray = [...arrayData]
  let currentArray = newArray
  const parts = parsePath(arrayPath)
  for (let i = 0; i < parts.length; i++) {
    let part = parts[i]
    const index = parseInt(part)
    if (!isNaN(index)) {
      part = index
    }
    if (i === parts.length - 1) {
      currentArray[part] = values
    } else {
      currentArray = currentArray[part]
    }
  }
  return newArray
}
