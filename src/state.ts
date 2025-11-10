import { addDays, startOfWeek } from 'date-fns'
import { create } from 'react'

export function mondayOf(date = new Date()){
  return startOfWeek(date, { weekStartsOn: 1 })
}

export function daysOfWeek(start: Date){
  return Array.from({length:5}, (_,i)=> addDays(start, i))
}

export type UIStatus = { admin: boolean, passphrase?: string|null }
