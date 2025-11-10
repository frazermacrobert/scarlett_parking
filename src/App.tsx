import React, { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { listBookingsForWeek, listEmployees, listResources, requestBooking, adminApprove, adminReject, adminFree, adminPromoteNext, type Booking, type Resource, type Employee } from './api'
import WeekNav from './components/WeekNav'
import Slot from './components/Slot'
import WaitlistPanel from './components/WaitlistPanel'
import RequestModal from './components/RequestModal'
import AdminBar from './components/AdminBar'
import scene from './assets/scene.svg'

type DayKey = string // yyyy-mm-dd

function onlyWeekdays(dates: Date[]){
  return dates.filter(d=> d.getDay()>=1 && d.getDay()<=5)
}
function monday(d=new Date()){
  const day = d.getDay() || 7
  const monday = new Date(d)
  monday.setDate(d.getDate() - day + 1)
  monday.setHours(0,0,0,0)
  return monday
}
function addDays(base: Date, i: number){
  const d = new Date(base); d.setDate(base.getDate()+i); return d
}

export default function App(){
  const [weekStart, setWeekStart] = useState(monday())
  const [resources, setResources] = useState<Resource[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [modal, setModal] = useState<{open:boolean, resId?:string, date?:string}>({open:false})
  const [admin, setAdmin] = useState<{enabled:boolean, pass?:string}>({enabled:false})
  const [error, setError] = useState<string|null>(null)

  useEffect(()=>{
    async function load(){
      try {
        const [res, emps] = await Promise.all([ listResources(), listEmployees() ])
        setResources(res)
        setEmployees(emps)
      } catch(err){
        setError((err as Error).message)
      }
    }
    load()
  },[])

  useEffect(()=>{
    async function load(){
      try {
        const bookings = await listBookingsForWeek(weekStart.toISOString().slice(0,10))
        setBookings(bookings)
      } catch(err){
        setError((err as Error).message)
      }
    }
    load()
  },[weekStart])

  const days = useMemo(()=> onlyWeekdays(Array.from({length:7},(_,i)=> addDays(weekStart,i))), [weekStart])
  const cars = useMemo(()=> resources.filter(r=> r.kind==='car'), [resources])
  const desks = useMemo(()=> resources.filter(r=> r.kind==='desk'), [resources])

  function statusFor(resourceId: string, dateISO: string): { s: 'empty'|'pending'|'confirmed', label: string, booking?: Booking }{
    const dayBookings = bookings.filter(b=> b.resource_id===resourceId && b.date===dateISO)
    const confirmed = dayBookings.find(b=> b.status==='confirmed')
    if(confirmed) return { s:'confirmed', label:'CONF' , booking: confirmed }
    const pending = dayBookings.find(b=> b.status==='pending')
    if(pending) return { s:'pending', label:'PEND', booking: pending }
    return { s:'empty', label:'+' }
  }

  async function openRequest(resource_id: string, date: string){
    setModal({open:true, resId: resource_id, date})
  }
  async function submitRequest(emp: string, note?: string){
    if(!modal.resId || !modal.date) return
    await requestBooking({ resource_id: modal.resId, date: modal.date, employee_id: emp, note })
    setModal({open:false})
    listBookingsForWeek(weekStart.toISOString().slice(0,10)).then(setBookings)
  }

  async function approve(id: string){
    if(!admin.enabled || !admin.pass) return
    await adminApprove(id, admin.pass)
    listBookingsForWeek(weekStart.toISOString().slice(0,10)).then(setBookings)
  }
  async function reject(id: string){
    if(!admin.enabled || !admin.pass) return
    await adminReject(id, admin.pass)
    listBookingsForWeek(weekStart.toISOString().slice(0,10)).then(setBookings)
  }
  async function freeSelected(){
    if(!admin.enabled || !admin.pass) return
    // Free the first confirmed in the visible week for the selected day is not tracked here, provide quick action via current day
    const date = new Date().toISOString().slice(0,10)
    // For demo simplicity, free all confirmed for today
    const toFree = bookings.filter(b=> b.date===date && b.status==='confirmed')
    await Promise.all(toFree.map(b=> adminFree(b.resource_id, date, admin.pass!)))
    listBookingsForWeek(weekStart.toISOString().slice(0,10)).then(setBookings)
  }
  async function promoteNext(){
    if(!admin.enabled || !admin.pass) return
    const date = new Date().toISOString().slice(0,10)
    const resIds = resources.map(r=> r.id)
    await Promise.all(resIds.map(id=> adminPromoteNext(id, date, admin.pass!)))
    listBookingsForWeek(weekStart.toISOString().slice(0,10)).then(setBookings)
  }

  return (
    <div className="app">
      {error && <div className="error-bar" onClick={()=> setError(null)}>{error}</div>}
      <div className="header">
        <h2>{import.meta.env.VITE_APP_TITLE || 'Scarlettabbott Parking'}</h2>
        <WeekNav weekStart={weekStart} onChange={setWeekStart} />
        <AdminBar
          isAdmin={admin.enabled}
          onLogin={(pass)=> setAdmin({enabled:true, pass})}
          onLogout={()=> setAdmin({enabled:false, pass:undefined})}
          onFree={freeSelected}
          onPromote={promoteNext}
        />
      </div>

      <div className="grid">
        <div className="scene">
          <img src={scene} alt="Map" style={{width:'100%', borderRadius:12, marginBottom:12}}/>
          {days.map((d, idxDay)=> (
            <div key={idxDay}>
              <h4>{format(d,'EEEE d MMM')}</h4>
              <div style={{display:'grid', gridTemplateColumns:'1fr', gap:8}}>
                <div>
                  <div className="footer-note">Car park</div>
                  <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:8}}>
                    {cars.map((r, idx)=> {
                      const st = statusFor(r.id, d.toISOString().slice(0,10))
                      return <button key={r.id} onClick={()=> st.s==='empty' && openRequest(r.id, d.toISOString().slice(0,10))} className={st.s==='confirmed'?'badge confirmed': st.s==='pending'?'badge pending':'badge'}>{r.label} · {st.label}</button>
                    })}
                  </div>
                </div>
                <div>
                  <div className="footer-note">Desks</div>
                  <div style={{display:'grid', gridTemplateColumns:'repeat(9, 1fr)', gap:8}}>
                    {desks.map((r, idx)=> {
                      const st = statusFor(r.id, d.toISOString().slice(0,10))
                      return <button key={r.id} onClick={()=> st.s==='empty' && openRequest(r.id, d.toISOString().slice(0,10))} className={st.s==='confirmed'?'badge confirmed': st.s==='pending'?'badge pending':'badge'}>{r.label} · {st.label}</button>
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <WaitlistPanel
          items={bookings.map(b=> ({
            ...b,
            employee: employees.find(e=> e.id===b.employee_id)!,
            resource: resources.find(r=> r.id===b.resource_id)!
          })).filter(x=> x.employee && x.resource)}
          onApprove={approve}
          onReject={reject}
          isAdmin={admin.enabled}
        />
      </div>

      <RequestModal
        open={modal.open}
        onClose={()=> setModal({open:false})}
        employees={employees}
        onSubmit={submitRequest}
      />

      <p className="footer-note">Need to cancel a confirmed booking? Please contact Sue on Microsoft Teams.</p>
    </div>
  )
}
