'use client'

import { useState, useEffect, useCallback } from 'react'

interface Props {
  words: string[]
  /** Velocidad de tipeo en ms por caracter */
  typeSpeed?: number
  /** Velocidad de borrado en ms por caracter */
  deleteSpeed?: number
  /** Pausa después de escribir la palabra completa */
  pauseTime?: number
  className?: string
}

/**
 * Efecto typewriter con cursor blink — escribe y borra palabras en loop.
 * Similar al vue-typer de Global66.
 */
export default function TypewriterText({
  words,
  typeSpeed = 80,
  deleteSpeed = 50,
  pauseTime = 2000,
  className = '',
}: Props) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const currentWord = words[currentWordIndex]

  const tick = useCallback(() => {
    if (isPaused) return

    if (!isDeleting) {
      // Escribiendo
      if (displayText.length < currentWord.length) {
        setDisplayText(currentWord.slice(0, displayText.length + 1))
      } else {
        // Palabra completa — pausar antes de borrar
        setIsPaused(true)
        setTimeout(() => {
          setIsPaused(false)
          setIsDeleting(true)
        }, pauseTime)
      }
    } else {
      // Borrando
      if (displayText.length > 0) {
        setDisplayText(displayText.slice(0, -1))
      } else {
        // Borrado completo — siguiente palabra
        setIsDeleting(false)
        setCurrentWordIndex((prev) => (prev + 1) % words.length)
      }
    }
  }, [displayText, isDeleting, isPaused, currentWord, words.length, pauseTime])

  useEffect(() => {
    const speed = isDeleting ? deleteSpeed : typeSpeed
    const timer = setTimeout(tick, speed)
    return () => clearTimeout(timer)
  }, [tick, isDeleting, typeSpeed, deleteSpeed])

  return (
    <span className={`inline-block ${className}`}>
      <span>{displayText}</span>
      <span
        className="inline-block w-[3px] h-[1em] bg-brand-600 ml-[2px] align-middle animate-blink"
        aria-hidden="true"
      />
    </span>
  )
}
