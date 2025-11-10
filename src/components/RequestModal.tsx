import React, { useState } from 'react'
import type { Employee } from '../api'

export default function RequestModal({ open, onClose, employees, onSubmit }:{ 
  open: boolean, onClose: ()=>void, employees: Employee[],
  onSubmit: (employee_id:string, note?:string)=>void
}){
  const [employee, setEmployee] = useState('')
  const [note, setNote] = useState('')
  if(!open) return null
  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal-card">
        <h3>Request this slot</h3>
        <label>Who are you?</label>
        <select value={employee} onChange={e=> setEmployee(e.target.value)}>
          <option value="" disabled>Pick your name</option>
          {employees.map(e=> <option key={e.id} value={e.id}>{e.name} · {e.department}</option>)}
        </select>
        <label>Note <span className="footer-note">(optional)</span></label>
        <textarea rows={3} value={note} onChange={e=> setNote(e.target.value)} placeholder="Anything the admin should know?"/>
        <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:12}}>
          <button onClick={onClose}>Close</button>
          <button className="primary" onClick={()=> { if(employee){ onSubmit(employee, note || undefined) }}}>Submit</button>
        </div>
      </div>
    </div>
  )
}
