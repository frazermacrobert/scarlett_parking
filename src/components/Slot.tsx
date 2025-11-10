import React from 'react'

type Props = {
  x: number, y: number, w: number, h: number, r: number
  status: 'empty'|'pending'|'confirmed'
  label: string
  onClick?: ()=>void
}

export default function Slot({ x,y,w,h,r,status,label,onClick }: Props){
  const cls = 'slot ' + (status === 'pending' ? 'pending' : status === 'confirmed' ? 'confirmed' : '')
  return (
    <g role="button" tabIndex={0} onClick={onClick} onKeyDown={e=> e.key==='Enter'&&onClick?.()}>
      <rect className={cls} x={x} y={y} width={w} height={h} rx={r}></rect>
      <text x={x+w/2} y={y+h/2} textAnchor="middle" dominantBaseline="middle" fontSize="14">{label}</text>
    </g>
  )
}
