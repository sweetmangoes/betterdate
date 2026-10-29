import { clsx } from 'clsx/lite'
import type { ReactNode } from 'react'

export type ThreadMessage =
  | { from: 'ai' | 'me'; text: ReactNode; muted?: boolean }
  | { from: 'ai'; link: { title: string; subtitle: string; label: string } }

/** Illustrative phone showing a text conversation with the product. Decorative, not interactive. */
export function TextThread({
  contactName,
  messages,
  className,
}: {
  contactName: string
  messages: ThreadMessage[]
  className?: string
}) {
  return (
    <div
      aria-hidden
      className={clsx('relative mx-auto h-[600px] w-[300px] rounded-[44px] bg-mauve-950 p-2.5 dark:bg-mauve-800', className)}
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-[35px] bg-white">
        <div className="absolute top-2.5 left-1/2 h-6 w-[86px] -translate-x-1/2 rounded-full bg-mauve-950" />
        <div className="flex h-10 shrink-0 items-center justify-between px-6 text-xs font-semibold text-mauve-950">
          <span>9:41</span>
          <span>5G</span>
        </div>
        <div className="border-b border-mauve-200 pt-0.5 pb-2.5 text-center">
          <div className="mx-auto mb-1 grid size-[38px] place-items-center rounded-full bg-rose-100 font-display text-[17px] text-rose-700">
            {contactName.charAt(0)}
          </div>
          <p className="text-[11.5px] font-semibold text-mauve-950">{contactName}</p>
        </div>
        <div className="flex flex-1 flex-col justify-end gap-1.5 overflow-hidden p-3">
          {messages.map((message, index) =>
            'link' in message ? (
              <div key={index} className="w-4/5 self-start overflow-hidden rounded-[17px] border border-mauve-200">
                <div className="grid h-[54px] place-items-center bg-rose-100 font-display text-[17px] text-rose-700">
                  {message.link.label}
                </div>
                <div className="bg-mauve-100 px-3 py-2 text-[11.5px] text-mauve-500">
                  <b className="block text-[12.5px] text-mauve-950">{message.link.title}</b>
                  {message.link.subtitle}
                </div>
              </div>
            ) : (
              <div
                key={index}
                className={clsx(
                  'max-w-[80%] rounded-[17px] px-3 py-2 text-[13px]/[1.38]',
                  message.from === 'me' && 'self-end bg-blue-500 text-white',
                  message.from === 'ai' && !message.muted && 'self-start bg-mauve-200 text-mauve-950',
                  message.from === 'ai' && message.muted && 'self-start bg-mauve-100 text-[11.5px] text-mauve-500',
                )}
              >
                {message.text}
              </div>
            ),
          )}
        </div>
        <div className="mx-3 mb-3.5 rounded-full border border-mauve-200 px-3.5 py-2 text-xs text-mauve-400">
          Text message
        </div>
      </div>
    </div>
  )
}
