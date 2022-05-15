import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { GoogleLogin, GoogleLogout } from 'react-google-login'

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
  const [videos, setVideos] = useState<string[][]>([])
  // const [videos, setVideos] = useState<string[]>([])
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

  // 動画を取得
  useEffect(() => {
    if (channelIds) {
      console.log('session: ', channelIds)
      let arr: string[][] = [] // channelIDを入れる

      // 結構すぐに限度になる
      channelIds?.map((channelId, i) => {
        console.log(`channelId[${i}]`, channelId)
        const params = {
          part: 'snippet',
          key: apikey,
          // channelId: kiyoID,
          channelId: channelId,
          maxResults: '2', // 取得数
          order: 'date',
        }
        const queryParams = new URLSearchParams(params)
        getApi(search_api_url + queryParams).then(
          (result) => {
            console.log('API success:', result)
            if (result.items && result.items.length !== 0) {
              //   const videosId = result.items.map((v, i) => {
              //     return v.id.videoId
              //   })
              // setVideos([...videos, videosId])
              // let arr: string[] = videos
              // result.items.map((v, i) => {
              //   arr.push(v.id.videoId)
              // })
              const videosId: string[] = result.items.map((v, i) => {
                return v.id.videoId
              })
              arr = [...arr, videosId]
              // setVideos(arr)

              const arr2: string[][] = [...videos]
              arr2.push(videosId)
              setVideos(arr2)
              // result.items.map((v, i) => {
              //   setVideos([...videos, v.id.videoId])
              // })
              // console.log(`videosId[${i}]: `, videosId)
              console.log(`setVideos[${i}]: `, videos)
              console.log(`arr[${i}]: `, arr)
              console.log(`arr2[${i}]: `, arr2)
            }
          },
          (error) => {
            console.error('err=>', error)
          }
        )
      })
      // if (arr.length != 0) {
      //   setVideos(arr)
      //   console.log('Allvideos: ', videos)
      // }
      // [0]の動画Id yV7w3C6ZLkg
    }
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

              {/* Logout出来ないけど、後回し */}
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
            {videos.map((v, i) => (
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
