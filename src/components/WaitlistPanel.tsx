import React from 'react'
import type { Booking, Employee, Resource } from '../api'

type Row = Booking & { employee: Employee, resource: Resource }

export default function WaitlistPanel({ items, onApprove, onReject, isAdmin }:{
  items: Row[]
  onApprove: (id: string)=>void
  onReject: (id: string)=>void
  isAdmin: boolean
}){
  const pending = items.filter(i=> i.status==='pending')
  return (
    <div className="panel">
      <h3>Waiting list</h3>
      {!pending.length && <p className="footer-note">No pending requests for this day.</p>}
      <ul className="waitlist">
        {pending.map(i => (
          <li key={i.id}>
            <div>
              <div><strong>{i.employee.name}</strong> <span className="footer-note">· {i.resource.kind} · {i.resource.label}</span></div>
              <div className="footer-note">{new Date(i.requested_at).toLocaleString()}</div>
            </div>
            {isAdmin && (
              <div>
                <button onClick={()=> onApprove(i.id)} className="primary">Approve</button>
                <button onClick={()=> onReject(i.id)} style={{marginLeft:8}}>Reject</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
