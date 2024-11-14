// Encode text to Base64
export function textToBase64(text: string) {
  return btoa(encodeURIComponent(text))
}

// Decode Base64 to text
export function base64ToText(base64: string) {
  return decodeURIComponent(atob(base64))
}

// Convert file to Base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      resolve(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  })
}
