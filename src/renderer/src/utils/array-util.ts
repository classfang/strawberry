export const getRandomElements = (arr: any[], count: number) => {
  // 拷贝原数组
  const _arr = arr.slice()

  // 数量判断
  if (count > arr.length) {
    return _arr
  }

  // 随机排序
  for (let i = _arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[_arr[i], _arr[j]] = [_arr[j], _arr[i]]
  }

  // 返回指定数量
  return _arr.slice(0, count)
}
