import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import React, { useCallback, useEffect, useState } from 'react'

const AuthPage: NextPage = () => {
  const { data: session } = useSession()
  return (
    <>
      <header>
        <div className='translate-y-[-5px] slide-left'>
          {session ? (
            <button className='danger-btn' onClick={() => signOut()}>
              LogOut
            </button>
          ) : (
            <button className='primary-btn' onClick={() => signIn()}>
              LogIn
            </button>
          )}
          <div className='float-right'>
            <Link href='/'>index</Link>
          </div>
        </div>
      </header>
      <div>{session?.user?.email}</div>
      <div>{session?.user?.name}</div>
      {console.log(session)}
    </>
  )
}
export default AuthPage
