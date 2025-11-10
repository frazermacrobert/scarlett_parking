import React, { useState } from 'react'

export default function AdminBar({ isAdmin, onLogin, onLogout, onFree, onPromote }:{
  isAdmin: boolean,
  onLogin: (pass: string) => void,
  onLogout: ()=>void,
  onFree: ()=>void,
  onPromote: ()=>void
}){
  const [pass, setPass] = useState('')
  return (
    <div style={{display:'flex', alignItems:'center', gap:8}}>
      {!isAdmin ? (
        <>
          <input type="password" placeholder="Admin passphrase" value={pass} onChange={e=> setPass(e.target.value)} />
          <button onClick={()=> onLogin(pass)}>Unlock</button>
        </>
      ) : (
        <>
          <button className="primary" onClick={onFree}>Free slot</button>
          <button onClick={onPromote}>Promote next</button>
          <button onClick={onLogout}>Lock</button>
        </>
      )}
    </div>
  )
}
