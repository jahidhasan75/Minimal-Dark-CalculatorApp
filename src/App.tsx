import { useCallback, useEffect, useState } from 'react'

const operators = ['÷', '×', '−', '+']
const calculate = (a: number, b: number, op: string) => op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : a / b
const format = (n: number) => Number.isFinite(n) ? String(Number(n.toPrecision(11))) : 'Error'

function Icon({ name }: { name: 'history' | 'back' | 'close' }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {name === 'history' ? <><path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/><path d="M12 7v5l3 2"/></> : name === 'back' ? <><path d="M9 5h11v14H9l-7-7Z"/><path d="m11 9 6 6m0-6-6 6"/></> : <path d="m6 6 12 12M18 6 6 18"/>}
  </svg>
}

export default function App() {
  const [value, setValue] = useState('0')
  const [stored, setStored] = useState<number | null>(null)
  const [operator, setOperator] = useState('')
  const [fresh, setFresh] = useState(false)
  const [expression, setExpression] = useState('')
  const [history, setHistory] = useState<{ expression: string; result: string }[]>([])
  const [showHistory, setShowHistory] = useState(false)

  const press = useCallback((key: string) => {
    if (key === 'AC') { setValue('0'); setStored(null); setOperator(''); setExpression(''); setFresh(false); return }
    if (key === '⌫') { setValue(v => v.length > 1 ? v.slice(0, -1) : '0'); setFresh(false); return }
    if (key === '+/−') { setValue(v => format(-Number(v))); return }
    if (key === '%') { setValue(v => format(Number(v) / 100)); return }
    if (operators.includes(key)) {
      const next = stored !== null && operator && !fresh ? calculate(stored, Number(value), operator) : Number(value)
      setStored(next); setValue(format(next)); setOperator(key); setExpression(`${format(next)} ${key}`); setFresh(true); return
    }
    if (key === '=') {
      if (stored === null || !operator) return
      const exp = `${format(stored)} ${operator} ${value}`
      const result = format(calculate(stored, Number(value), operator))
      setExpression(`${exp} =`); setValue(result); setHistory(h => [{ expression: exp, result }, ...h].slice(0, 30))
      setStored(null); setOperator(''); setFresh(true); return
    }
    if (/^[0-9.]$/.test(key)) {
      if (fresh || value === 'Error') { setValue(key === '.' ? '0.' : key); setFresh(false); if (!operator) setExpression(''); return }
      if (key === '.' && value.includes('.')) return
      setValue(v => v.length >= 13 ? v : v === '0' && key !== '.' ? key : v + key)
    }
  }, [value, stored, operator, fresh])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const map: Record<string, string> = { Enter: '=', Escape: 'AC', Backspace: '⌫', '*': '×', '/': '÷', '-': '−' }
      if (/^[0-9.+%=/\-*]$/.test(event.key) || event.key in map) { event.preventDefault(); press(map[event.key] || event.key) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [press])

  return <main className="workspace">
    <header className="brand"><span className="brand-mark">c<span>·</span></span><span className="brand-title">Calculator</span></header>
    <div className="stage">
      <section className="calculator" aria-label="Calculator">
        <div className="phone-status" aria-hidden="true"><span>9:41</span><div className="phone-island"/><span className="phone-signals">▮▮▮ <span className="phone-battery"/></span></div>
        <div className="calculator-header"><span>Calculator</span><button className={`icon-button ${showHistory ? 'active' : ''}`} aria-label="Calculation history" onClick={() => setShowHistory(!showHistory)}><Icon name={showHistory ? 'close' : 'history'}/></button></div>
        {showHistory ? <div className="history"><div className="history-title">History <button onClick={() => setHistory([])}>Clear all</button></div>{history.length ? history.map((item, i) => <button className="history-item" key={i} onClick={() => { setValue(item.result); setExpression(`${item.expression} =`); setStored(null); setOperator(''); setFresh(true); setShowHistory(false) }}><span>{item.expression} =</span><strong>{item.result}</strong></button>) : <div className="empty-history">A fresh start.<span>Your calculations will appear here.</span></div>}</div> : <>
        <div className="display"><div className="expression">{expression || '\u00a0'}</div><div className={`value ${value.length > 9 ? 'small-value' : ''}`} aria-live="polite">{value === 'Error' ? value : value.includes('.') ? value : Number(value).toLocaleString('en-US')}</div><div className="display-bottom"><span>LET’S KEEP IT SIMPLE</span><button aria-label="Backspace" onClick={() => press('⌫')}><Icon name="back"/></button></div></div>
        <div className="keypad">{['AC', '+/−', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', '0', '.', '='].map(key => <button key={key} onClick={() => press(key)} className={`key ${operators.includes(key) ? 'operator' : ''} ${['AC', '+/−', '%'].includes(key) ? 'utility' : ''} ${key === '0' ? 'zero' : ''} ${key === '=' ? 'equals' : ''} ${operator === key ? 'selected' : ''}`} aria-label={key === '=' ? 'Equals' : key === 'AC' ? 'All clear' : key === '+/−' ? 'Toggle sign' : key}>{key}</button>)}</div>
        </>}
        <div className="home-indicator" aria-hidden="true"/>
      </section>
    </div>
  </main>
}
