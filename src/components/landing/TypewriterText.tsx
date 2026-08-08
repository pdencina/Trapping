'use client'

import { useState, useEffect, useRef } from 'react'

interface Props {
  words: string[]
  typeSpeed?: number
  deleteSpeed?: number
  pauseTime?: number
  className?: string
}

/**
 * Typewriter con cursor blink — escribe y borra palabras en loop.
 * Estilo Global66 / vue-typer.
 */
export default function TypewriterText({
  words,
  typeSpeed = 90,
  deleteSpeed = 50,
  pauseTime = 2200,
  className = '',
}: Props) {
  const [text, setText] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const currentWord = words[wordIndex]

    const handleType = () => {
      if (!isDeleting) {
        // Escribiendo
        if (text.length < currentWord.length) {
          setText(currentWord.slice(0, text.length + 1))
          timeoutRef.current = setTimeout(handleType, typeSpeed)
        } else {
          // Palabra completa, pausar y luego borrar
          timeoutRef.current = setTimeout(() => {
            setIsDeleting(true)
          }, pauseTime)
        }
      } else {
        // Borrando
        if (text.length > 0) {
          setText(text.slice(0, -1))
          timeoutRef.current = setTimeout(handleType, deleteSpeed)
        } else {
          // Borrado completo, siguiente palabra
          setIsDeleting(false)
          setWordIndex((prev) => (prev + 1) % words.length)
        }
      }
    }

    timeoutRef.current = setTimeout(handleType, isDeleting ? deleteSpeed : typeSpeed)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [text, isDeleting, wordIndex, words, typeSpeed, deleteSpeed, pauseTime])

  return (
    <span className={className}>
      {text}
      <span
        className="inline-block w-[4px] h-[0.85em] bg-brand-600 ml-1 align-middle animate-blink rounded-sm"
        aria-hidden="true"
      />
    </span>
  )
}
