import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function getPlaceholderImage(category = '', type = '') {
  const images = {
    'Hrubá stavba': 'https://images.unsplash.com/photo-1590069230002-70cc83bc50aa?auto=format&fit=crop&q=80&w=800',
    'Suchá výstavba': 'https://images.unsplash.com/photo-1517646272486-a28f991f14c8?auto=format&fit=crop&q=80&w=800',
    'Záhrada': 'https://images.unsplash.com/photo-1558905619-17254203dc1d?auto=format&fit=crop&q=80&w=800',
    'Farby': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800',
    'default_material': 'https://images.unsplash.com/photo-1503387762-592dea58ef0e?auto=format&fit=crop&q=80&w=800',
    'default_tool': 'https://images.unsplash.com/photo-1581244276891-99af93b6e82a?auto=format&fit=crop&q=80&w=800',
    'default_rental': 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&q=80&w=800'
  }

  if (images[category]) return images[category]
  if (type === 'tool') return images.default_tool
  if (type === 'rental') return images.default_rental
  return images.default_material
}

export function compressImage(file, options = {}) {
  return new Promise((resolve, reject) => {
    const { maxWidth = 1200, maxHeight = 1200, quality = 0.75 } = options

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Calculate aspect ratio and resize if larger than bounds
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas toBlob returned null'))
              return
            }
            // Create a new File object from the blob, converting to webp
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + '.webp', {
              type: 'image/webp',
              lastModified: Date.now(),
            })
            resolve(compressedFile)
          },
          'image/webp',
          quality
        )
      }
      img.onerror = (err) => reject(err)
    }
    reader.onerror = (err) => reject(err)
  })
}
