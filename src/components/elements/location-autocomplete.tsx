'use client'

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { clsx } from 'clsx/lite'

type Suggestion = {
  placeId: string
  text: string
  mainText: string
  secondaryText: string
}

type LocationAutocompleteProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
  'aria-label'?: string
}

const DEBOUNCE_MS = 250

export function LocationAutocomplete({
  value,
  onChange,
  placeholder,
  className,
  autoFocus,
  'aria-label': ariaLabel,
}: LocationAutocompleteProps) {
  const listboxId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const [loading, setLoading] = useState(false)
  const skipFetchRef = useRef(false)

  useEffect(() => {
    if (skipFetchRef.current) {
      skipFetchRef.current = false
      return
    }

    const query = value.trim()
    if (query.length < 2) {
      setSuggestions([])
      setOpen(false)
      setLoading(false)
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch(
          `/api/places/autocomplete?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        )
        if (!response.ok) {
          setSuggestions([])
          return
        }
        const body = (await response.json()) as { suggestions?: Suggestion[] }
        const next = body.suggestions ?? []
        setSuggestions(next)
        setHighlightIndex(-1)
        setOpen(next.length > 0)
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setSuggestions([])
          setOpen(false)
        }
      } finally {
        setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [value])

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setHighlightIndex(-1)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  function selectSuggestion(suggestion: Suggestion) {
    skipFetchRef.current = true
    onChange(suggestion.text)
    setSuggestions([])
    setOpen(false)
    setHighlightIndex(-1)
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) {
      if (event.key === 'Escape') setOpen(false)
      return
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setHighlightIndex((i) => (i + 1) % suggestions.length)
        break
      case 'ArrowUp':
        event.preventDefault()
        setHighlightIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
        break
      case 'Enter':
        if (highlightIndex >= 0 && suggestions[highlightIndex]) {
          event.preventDefault()
          selectSuggestion(suggestions[highlightIndex])
        }
        break
      case 'Escape':
        event.preventDefault()
        setOpen(false)
        setHighlightIndex(-1)
        break
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          highlightIndex >= 0 ? `${listboxId}-option-${highlightIndex}` : undefined
        }
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true)
        }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={className}
        autoFocus={autoFocus}
        autoComplete="off"
        spellCheck={false}
      />

      {open && suggestions.length > 0 && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1.5 max-h-64 w-full overflow-auto rounded-2xl border border-mauve-950/10 bg-white py-1.5 shadow-lg dark:border-white/10 dark:bg-mauve-950"
        >
          {suggestions.map((suggestion, index) => {
            const highlighted = index === highlightIndex
            return (
              <li key={suggestion.placeId} role="presentation">
                <button
                  type="button"
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={highlighted}
                  className={clsx(
                    'flex w-full flex-col gap-0.5 px-4 py-2.5 text-left transition',
                    highlighted
                      ? 'bg-rose-50 text-mauve-950 dark:bg-rose-950/50 dark:text-white'
                      : 'text-mauve-950 hover:bg-mauve-950/5 dark:text-white dark:hover:bg-white/10',
                  )}
                  onMouseEnter={() => setHighlightIndex(index)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectSuggestion(suggestion)}
                >
                  <span className="text-sm/6 font-semibold">{suggestion.mainText}</span>
                  {suggestion.secondaryText && (
                    <span className="text-xs/5 text-mauve-600 dark:text-mauve-400">
                      {suggestion.secondaryText}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
          <li className="border-t border-mauve-950/5 px-4 py-2 text-[10px] tracking-wide text-mauve-500 dark:border-white/5 dark:text-mauve-400">
            {loading ? 'Searching…' : 'Powered by Google'}
          </li>
        </ul>
      )}
    </div>
  )
}
