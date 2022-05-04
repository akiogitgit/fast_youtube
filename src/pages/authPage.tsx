import type { NextPage } from 'next'
import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { GoogleLogin, GoogleLogout } from 'react-google-login'

const AuthPage: NextPage = () => {
  // https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=アクセストークン
  // https://www.googleapis.com/youtube/v3/channels?part=id&mine=true&key=APIKEY
  const { data: session } = useSession()
  const [accessToken, setAccessToken] = useState('')

  const onSuccess = (
    res:
      | ReactGoogleLogin.GoogleLoginResponse
      | ReactGoogleLogin.GoogleLoginResponseOffline
  ) => {
    if ('accessToken' in res) {
      console.log(res.accessToken)
      setAccessToken(res.accessToken)
    }
  }
  const onFailure = (res: any) => {
    alert(JSON.stringify(res))
  }

  const apikey = String(process.env.NEXT_PUBLIC_YOUTUBE_APIKEY)
  // const apikey = String(process.env.NEXT_PUBLIC_YOUTUBE_APIKEY2)
  const search_channel_url = 'https://www.googleapis.com/youtube/v3/channels?'

  useEffect(() => {
    const params = {
      part: 'id',
      mine: 'true',
      key: apikey,
      // access_token: String(session?.accessToken),
      access_token: accessToken,
    }
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
  }, [session, accessToken])

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

      <div>
        {accessToken === '' ? (
          <>
            {/* ページ遷移で消えるからヘッダーでやる */}
            <GoogleLogin
              clientId={String(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)}
              buttonText='Login'
              isSignedIn={true}
              onSuccess={onSuccess}
              onFailure={onFailure}
              scope='https://www.googleapis.com/auth/youtube'
              cookiePolicy={'single_host_origin'}
            />
          </>
        ) : (
          <>
            <div className='mt-10'>react-google-auth!</div>
            {accessToken}

            {/* Logout出来ないけど、後回し */}
            <GoogleLogout
              clientId={String(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)}
              buttonText='Logout'
            ></GoogleLogout>
          </>
        )}
      </div>
    </>
  )
}
export default AuthPage
