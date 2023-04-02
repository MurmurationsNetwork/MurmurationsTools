// use regex to get the array and object path.
// For example, array[0].relationships[0].respects[0].domain will be parsed as ['array', '0', 'relationships', '0', 'respects', '0', 'domain']
export const parsePath = parentFieldName => {
  const regex = /(?<=\[)\d+(?=\])|\w+/g
  return parentFieldName.match(regex)
}
