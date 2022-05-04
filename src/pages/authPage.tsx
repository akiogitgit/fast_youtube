import type { NextPage } from 'next'
import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import React, { useEffect } from 'react'

const AuthPage: NextPage = () => {
  // https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=アクセストークン
  // https://www.googleapis.com/youtube/v3/channels?part=id&mine=true&key=APIKEY
  const { data: session } = useSession()

  const apikey = String(process.env.NEXT_PUBLIC_YOUTUBE_APIKEY)
  // const apikey = String(process.env.NEXT_PUBLIC_YOUTUBE_APIKEY2)
  const search_channel_url = 'https://www.googleapis.com/youtube/v3/channels?'

  useEffect(() => {
    const params = {
      part: 'id',
      mine: 'true',
      key: apikey,
      access_token: String(session?.accessToken),
    }
    // const params = {
    //   part: 'snippet',
    //   key: apikey,
    //   type: 'channel', // video, channel, playlist
    //   q: "a", // キヨ、KIYOisGOD
    //   maxResults: '1', // 取得数
    // }
    console.log('accessToken', session?.accessToken)
    const queryParams = new URLSearchParams(params)
    fetch(search_channel_url + queryParams)
      .then((res) => res.json())
      .then(
        (result) => {
          console.log('channel情報:', result)
        },
        (error) => {
          console.error('err=>', error)
        }
      )
  }, [session])

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
      <div>{session?.accessToken}</div>
      {console.log(session)}
    </>
  )
}
export default AuthPage
