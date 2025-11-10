import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supa = createClient(url, key)

export type Resource = { id: string, kind: 'car'|'desk', label: string, is_active: boolean }
export type Employee = { id: string, name: string, department: string, email?: string|null, is_active: boolean }
export type Booking = {
  id: string, resource_id: string, date: string, status: 'pending'|'confirmed'|'rejected'|'cancelled',
  employee_id: string, requested_at: string, approved_at: string|null, approved_by: string|null, note: string|null
}

export async function listResources(){
  const { data, error } = await supa.from('resources').select('*').eq('is_active', true).order('label')
  if(error) throw error
  return data as Resource[]
}

export async function listEmployees(){
  const { data, error } = await supa.from('employees').select('id,name,department,is_active').eq('is_active', true).order('name')
  if(error) throw error
  return data as Employee[]
}

export async function listBookingsForWeek(weekStartISO: string){
  const start = new Date(weekStartISO)
  const end = new Date(start)
  end.setDate(start.getDate() + 7)
  const { data, error } = await supa
    .from('bookings')
    .select('*')
    .gte('date', start.toISOString().slice(0,10))
    .lt('date', end.toISOString().slice(0,10))
    .in('status', ['pending','confirmed'])
  if(error) throw error
  return data as Booking[]
}

export async function requestBooking(params: { resource_id: string, date: string, employee_id: string, note?: string }){
  const { data, error } = await supa.rpc('enforce_quota_and_create', {
    p_resource_id: params.resource_id,
    p_date: params.date,
    p_employee_id: params.employee_id,
    p_note: params.note ?? null
  })
  if(error) throw error
  return data
}

export async function adminApprove(bookingId: string, passphrase: string){
  const { data, error } = await supa.rpc('approve_booking', { p_booking_id: bookingId, p_passphrase: passphrase })
  if(error) throw error
  return data
}

export async function adminReject(bookingId: string, passphrase: string){
  const { data, error } = await supa.rpc('reject_booking', { p_booking_id: bookingId, p_passphrase: passphrase })
  if(error) throw error
  return data
}

export async function adminFree(resourceId: string, date: string, passphrase: string){
  const { data, error } = await supa.rpc('free_slot', { p_resource_id: resourceId, p_date: date, p_passphrase: passphrase })
  if(error) throw error
  return data
}

export async function adminPromoteNext(resourceId: string, date: string, passphrase: string){
  const { data, error } = await supa.rpc('promote_next_waitlist', { p_resource_id: resourceId, p_date: date, p_passphrase: passphrase })
  if(error) throw error
  return data
}
