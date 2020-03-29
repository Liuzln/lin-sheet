const columnsName = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'N',
  'M', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
]

export function getColumnsName (index) {
  let content = ''
  if (index < 26) {
    content = columnsName[index]
  } else {
    let temp = index - 26
    let count = 0
    while (temp >= 26) {
      temp -= 26
      count++
    }
    content = columnsName[count]
    content += columnsName[index % 26]
  }
  return content
}
