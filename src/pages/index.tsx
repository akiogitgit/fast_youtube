import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'
import { GoogleLogin, GoogleLogout } from 'react-google-login'

type videos = string[][]

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

  // 限度になったら変える
  // const apikey = String(process.env.NEXT_PUBLIC_YOUTUBE_APIKEY)
  const apikey = String(process.env.NEXT_PUBLIC_YOUTUBE_APIKEY2)

  // const [videos, setVideos] = useState([])
  const [videos, setVideos] = useState<videos>([])
  const [channelIds, setChannelIds] = useState([''])
  // const [word, setWord] = useState<string>('')
  // const [searchWord, setSearchWord] = useState<string>('にゃんこ')

  // 登録しているチャンネルidを取得
  const subscript_url = 'https://www.googleapis.com/youtube/v3/subscriptions?'
  // チャンネル毎の動画を取得
  const search_api_url = 'https://www.googleapis.com/youtube/v3/search?'
  const getApi = async (url: string) => {
    try {
      const res = await fetch(url)
      return await res.json()
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    if (sessionStorage.getItem('channelId')) {
      setChannelIds(sessionStorage.getItem('channelId')?.split(',') || [''])
    }
  }, [accessToken])

  // channelIdを取得 subscriptions
  useEffect(() => {
    if (accessToken) {
      const params = {
        part: 'snippet',
        mine: 'true',
        key: apikey,
        access_token: accessToken,
      }
      const queryParams = new URLSearchParams(params)
      getApi(subscript_url + queryParams).then(
        (result) => {
          console.log('Loginした、channel情報:', result)
          if (result.items && result.items.length !== 0) {
            let channelId = result.items.map((v, i) => {
              return v.snippet.resourceId.channelId
            })
            // setChannels(channelId)
            // console.log('resourcedId: ', result.items[0].snippet.resourceId)
            console.log('channeId取得: ', channelId)
            // console.log('channels: ', channels)
            sessionStorage.setItem('channelId', channelId.join())
          }
        },
        (err) => {
          console.error('err=>', err)
        }
      )
    }
  }, [accessToken])

  const makeVideoQuery = (channelId: string) => {
    const params = {
      part: 'snippet',
      key: apikey,
      channelId: channelId,
      maxResults: '3', // 取得数 1でも50でも消費量同じ
      order: 'date',
    }
    return new URLSearchParams(params)
  }

  const mapResult = channelIds.map((channelId) => {
    const queryParams = makeVideoQuery(channelId)
    return getApi(search_api_url + queryParams).then(
      (result) => {
        console.log('API success:', result)
        if (result.items && result.items.length !== 0) {
          const videosId: string[] = result.items.map((v, i) => {
            return v.id.videoId
          })
          setVideos((videos) => [...videos, videosId])
        }
      },
      (error) => {
        console.error('err=>', error)
      }
    )
  })

  const getVideos = useCallback(async () => {
    if (!channelIds.length) {
      return
    }
    const getAwaitPromiseAll = await Promise.all(mapResult)
    console.log('Promise: ', getAwaitPromiseAll)
    // let arr: videos = []
    // channelIds.forEach((channelId, i) => {
    //   const queryParams = makeVideoQuery(channelId)
    //   // const queryParams = makeVideoQuery('UCg94A9An85nXCFSguNx3gYA')

    //   getApi(search_api_url + queryParams).then(
    //     (result) => {
    //       console.log('API success:', result)
    //       if (result.items && result.items.length !== 0) {
    //         const videosId: string[] = result.items.map((v, i) => {
    //           return v.id.videoId
    //         })
    //         setVideos([...videos, videosId])
    //         arr = [...arr, videosId]
    //         console.log(`setVideos: `, videos)
    //         console.log(`arr: `, arr)
    //       }
    //     },
    //     (error) => {
    //       console.error('err=>', error)
    //     }
    //   )
    // })
  }, [])

  // 動画を取得
  // useEffect内でawait使えない
  useEffect(() => {
    getVideos()
  }, [channelIds])

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

  const deleteChannel = (channel: string) => {
    if (channel) {
      const index = channelIds.indexOf(channel)
      if (index != -1) {
        const arr = channelIds
        arr.splice(index, 1)
        setChannelIds(arr)
        sessionStorage.setItem('channelId', channelIds.join())
        // console.log('channelIds', channelIds)
      }
    }
  }

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name='description' content='Generated by create next app' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <header>
        <div className='translate-y-[-5px] slide-left'>
          <div className='float-right'>
            <Link href='/youtubeTest'>test</Link>
            <Link href='/youtubeLayout'> layout</Link>
            <Link href='/authPage'> authPage</Link>
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
                // isSignedIn={true}
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
              {/* <GoogleLogout
                clientId={String(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)}
                buttonText='Logout'
                onLogoutSuccess={logout}
              ></GoogleLogout> */}
            </>
          )}
        </div>

        <div>
          <h1 className='text-red-500 text-[10px]'>
            Welcome to <a href='https://nextjs.org'>Next.js!</a>
          </h1>
          <div>
            {/* {arr &&
              arr.map((v, i) => (
                <div key={i}>
                  <p onClick={() => deleteChannel(channelIds[i])}>
                    {channelIds[i]}このチャンネルを取得しない
                  </p>
                  <div className='flex mb-4 overflow-x-scroll'>
                    {v.map((video, index) => (
                      <div key={index}>
                        <iframe
                          id='player'
                          width='300'
                          height='200'
                          src={'https://www.youtube.com/embed/' + video}
                          frameBorder='0'
                          allowFullScreen
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))} */}
            <div>{videos && videos}</div>
            <br></br>
            <br></br>
            {videos &&
              videos.map((v, i) => (
                <div key={i}>
                  <p onClick={() => deleteChannel(channelIds[i])}>
                    {channelIds[i]}このチャンネルを取得しない
                  </p>
                  <div className='flex mb-4 overflow-x-scroll'>
                    {v.map((video, index) => (
                      <div key={index}>
                        <iframe
                          id='player'
                          width='300'
                          height='200'
                          src={'https://www.youtube.com/embed/' + video}
                          frameBorder='0'
                          allowFullScreen
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>

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
        </div>
      </main>
      <footer></footer>
    </div>
  )
}

export default Home
