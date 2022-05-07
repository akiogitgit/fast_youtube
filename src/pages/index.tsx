import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import React, { useCallback, useEffect, useState } from 'react'
import { GoogleLogin, GoogleLogout } from 'react-google-login'

interface videos {}

const Home: NextPage = () => {
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

  // const { data: session } = useSession()
  const apikey = String(process.env.NEXT_PUBLIC_YOUTUBE_APIKEY)
  // const apikey = String(process.env.NEXT_PUBLIC_YOUTUBE_APIKEY2)
  const channelID = 'UCMJiPpN_09F0aWpQrgbc_qg' //配列にする

  const [videos, setVideos] = useState<string[]>([''])
  const [channels, setChannels] = useState<string[]>([''])
  // const [word, setWord] = useState<string>('')
  // const [searchWord, setSearchWord] = useState<string>('にゃんこ')

  // 登録しているチャンネルidを取得
  const search_channel_url = 'https://www.googleapis.com/youtube/v3/channels?'
  const subscript_url = 'https://www.googleapis.com/youtube/v3/subscriptions?'
  // チャンネル毎の動画を取得
  const search_api_url = 'https://www.googleapis.com/youtube/v3/search?'

  // channelIdを取得 subscriptions
  useEffect(() => {
    const params = {
      part: 'snippet',
      mine: 'true',
      key: apikey,
      access_token: accessToken,
    }
    const queryParams = new URLSearchParams(params)
    fetch(subscript_url + queryParams)
      .then((res) => res.json())
      .then(
        (result) => {
          console.log('channel情報:', result)
          if (result.items && result.items.length !== 0) {
            const channelId = result.items.map((v, i) => {
              // sessionStorage.setItem(
              //   v.snippet.title,
              //   v.snippet.resourceId.channelId
              // )
              return v.snippet.resourceId.channelId
            })
            setChannels(channelId)
            // console.log('resourcedId: ', result.items[0].snippet.resourceId)
            console.log('channels: ', channels)
            sessionStorage.setItem('channelId', channels.join())
          }
        },
        (error) => {
          console.error('err=>', error)
        }
      )
  }, [apikey, accessToken])

  // 動画を取得
  useEffect(() => {
    const params = {
      part: 'snippet',
      key: apikey,
      channelId: channelID,
      type: 'video',
      maxResults: '10', // 取得数
      order: 'data',
    }
    const queryParams = new URLSearchParams(params)
    fetch(search_api_url + queryParams)
      .then((res) => res.json())
      .then(
        (result) => {
          console.log('API success:', result)
          if (result.items && result.items.length !== 0) {
            // titleもチャンネル名もいらない(iframeでおけ)
            // 縦方向がチャンネル、横方向が同じチャンネルの動画
            const videosId = result.items.map((v, i) => {
              return v.id.videoId
            })
            setVideos(videosId)

            // let arr: videos[] = []
            // result.items.map((v, i) => {
            //   arr.push({
            //     videoId: v.id.videoId,
            //     channelName: v.snippet.channelTitle,
            //     title: v.snippet.title,
            //   })
            // })
            // setVideos(arr)
          }
        },
        (error) => {
          console.error('err=>', error)
        }
      )
  }, [channelID, apikey])

  // const onSearch = useCallback(
  //   (e: React.FormEvent<HTMLFormElement>) => {
  //     e.preventDefault()
  //     setSearchWord(word)
  //   },
  //   [word]
  // )
  // const changeWord = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  //   setWord(e.target.value)
  // }, [])

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name='description' content='Generated by create next app' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <header>
        <div className='translate-y-[-5px] slide-left'>
          {/* {session ? (
            <button className='danger-btn' onClick={() => signOut()}>
              LogOut
            </button>
          ) : (
            <button className='primary-btn' onClick={() => signIn()}>
              LogIn
            </button>
          )} */}
          <div className='float-right'>
            <Link href='/youtubeTest'>test</Link>
            <Link href='/authPage'>authPage</Link>
          </div>
        </div>
      </header>

      <main>
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

        <div>
          <h1 className='text-red-500 text-[10px]'>
            Welcome to <a href='https://nextjs.org'>Next.js!</a>
          </h1>
          {/* <form onSubmit={(e) => onSearch(e)}>
            <input
              type='text'
              value={word}
              onChange={changeWord}
              className='border border-black'
            />
            <input
              type='submit'
              value='検索'
              className='ml-2 border border-black'
            />
          </form>
          <div onClick={() => setSearchWord('わんこ')}>わんこ</div> */}
          {videos &&
            videos.map((v, i) => (
              <div key={i}>
                <iframe
                  id='player'
                  width='640'
                  height='360'
                  src={'https://www.youtube.com/embed/' + v}
                  frameBorder='0'
                  allowFullScreen
                />
              </div>
            ))}
          {/* <iframe
            id='player'
            width='640'
            height='360'
            src={'https://www.youtube.com/embed/' + videos}
            // src={'https://www.youtube.com/embed/' + 'oEbtRMeZR24'}
            frameBorder='0'
            allowFullScreen
          /> */}
        </div>
      </main>
      <footer></footer>
    </div>
  )
}

export default Home
