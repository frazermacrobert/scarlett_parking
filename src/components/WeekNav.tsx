import React from 'react'
import { format, addWeeks, startOfWeek } from 'date-fns'

type Props = {
  weekStart: Date
  onChange: (d: Date) => void
}

export default function WeekNav({ weekStart, onChange }: Props){
  return (
    <div className="weeknav">
      <button className="iconbtn" onClick={()=> onChange(addWeeks(weekStart, -1))} aria-label="Previous week">◀</button>
      <div aria-live="polite"><strong>{format(weekStart, 'EEE d MMM')}</strong> to <strong>{format(new Date(weekStart.getTime()+4*86400000), 'EEE d MMM')}</strong></div>
      <button className="iconbtn" onClick={()=> onChange(addWeeks(weekStart, 1))} aria-label="Next week">▶</button>
      <input type="date" onChange={e=> {
        const picked = new Date(e.target.value + 'T00:00:00')
        const start = startOfWeek(picked, { weekStartsOn:1 })
        onChange(start)
      }}/>
    </div>
  )
}
