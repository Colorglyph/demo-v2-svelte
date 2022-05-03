export function handleResponse(res) {
  if (res.ok)
    return res.json()
  throw res
}

export function compressAccount(account) {
  return `${account.substring(0, 4)}...${account.slice(-4)}`
}