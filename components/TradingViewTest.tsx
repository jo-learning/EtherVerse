import { useEffect, useRef, useState } from 'react'

interface TradingViewWidgetProps {
  symbol: string
  interval?: string
  width?: string | number
  height?: string | number
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  symbol,
  interval = 'D',
  width = '100%',
  height = 500,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Detect Tailwind's dark mode class on the html element
    const isDark = document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'dark' : 'dark')
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/tv.js'
    script.async = true
    script.onload = () => {
      if ((window as any).TradingView) {
        new (window as any).TradingView.widget({
          container_id: 'tradingview_widget',
          width,
          height,
          symbol,
          interval,
          timezone: 'Etc/UTC',
          theme,
          style: '1',
          locale: 'en',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          hide_side_toolbar: true,
          allow_symbol_change: true,
          details: false,
          hotlist: false,
          calendar: true,
          studies: ['MACD@tv-basicstudies'],
        })
      }
    }

    containerRef.current.innerHTML = ''
    containerRef.current.appendChild(script)

    return () => {
      containerRef.current && (containerRef.current.innerHTML = '')
    }
  }, [symbol, interval, theme, width, height])

  return <div id="tradingview_widget" ref={containerRef}></div>
}

export default TradingViewWidget
