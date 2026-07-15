const maxImageEdge = 1200
const webpQuality = 0.78

export interface LocalImage {
  id: string
  src: string
}

export async function createLocalImages(files: File[], availableSlots: number, idPrefix: string) {
  const selectedFiles = files.slice(0, Math.max(0, availableSlots))
  const timestamp = Date.now()

  return Promise.all(
    selectedFiles.map(async (file, index): Promise<LocalImage> => ({
      id: `${idPrefix}-${timestamp}-${index}`,
      src: await compressImage(file),
    })),
  )
}

async function compressImage(file: File) {
  if (!file.type.startsWith('image/')) {
    throw new Error('请选择图片文件')
  }

  const sourceUrl = URL.createObjectURL(file)

  try {
    const image = await loadImage(sourceUrl)
    const longestEdge = Math.max(image.naturalWidth, image.naturalHeight)
    const scale = longestEdge > maxImageEdge ? maxImageEdge / longestEdge : 1
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))

    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('浏览器无法处理该图片')
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/webp', webpQuality)

    if (!dataUrl || dataUrl === 'data:,') {
      throw new Error('图片转换失败')
    }

    return dataUrl
  } finally {
    URL.revokeObjectURL(sourceUrl)
  }
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('图片读取失败'))
    image.src = src
  })
}
