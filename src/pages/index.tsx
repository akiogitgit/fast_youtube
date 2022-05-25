import type { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'
import { GoogleLogin } from 'react-google-login'

type Videos = string[][]

type SubscriptionItems = { snippet: { resourceId: { channelId: string } } }
type ResultChannel = {
  items: Array<SubscriptionItems>
}

type SearchItems = { id: { videoId: string } }
type ResultVideo = {
  // items: { id: { videoId: string } }[]
  items: Array<SearchItems>
}

const Home: NextPage = () => {
  const [accessToken, setAccessToken] = useState('')
  const date = new Date()
  const date2 = date.getTime()
  const [sessionDate, setSessionDate] = useState(0)

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
  const apikey = String(process.env.NEXT_PUBLIC_YOUTUBE_APIKEY)
  // const apikey = String(process.env.NEXT_PUBLIC_YOUTUBE_APIKEY2)

  const [videos, setVideos] = useState<Videos>([])
  const [channelIds, setChannelIds] = useState([''])

  const subscript_url = 'https://www.googleapis.com/youtube/v3/subscriptions?'
  const search_api_url = 'https://www.googleapis.com/youtube/v3/search?'
  const env = process.env.NODE_ENV

  const getApi = async (url: string) => {
    try {
      const res = await fetch(url)
      return await res.json()
    } catch (error) {
      throw error
    }
  }

  // sessionから channelIdを取得
  useEffect(() => {
    if (sessionStorage.getItem('channelId')) {
      setChannelIds(sessionStorage.getItem('channelId')?.split(',') || [''])
      console.log('sessionからchannelIdをセット！', channelIds)
    }

    // 取得した時の日時を取得
    if (sessionStorage.getItem('setDate')) {
      setSessionDate(Number(sessionStorage.getItem('setDate')))
      console.log('sessionDate', sessionDate)
    }
  }, [accessToken])

  // videoIDを取得
  useEffect(() => {
    if (sessionStorage.getItem('videoId')) {
      setVideos(
        String(sessionStorage.getItem('videoId'))
          .split(',')
          .map((v) => {
            return v.trim().replace(/\s+/g, ' ').split(' ')
          })
      )
      console.log('sessionからvideosをセット！', videos)
    }
  }, [accessToken, channelIds])

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
        (result: ResultChannel) => {
          console.log('Loginした、channel情報:', result)
          if (result.items && result.items.length !== 0) {
            const channelId = result.items.map((v, i) => {
              return v.snippet.resourceId.channelId
            })
            console.log('API channeId取得: ', channelId)
            setVideos([])
            sessionStorage.setItem('channelId', channelId.join())
          }
        },
        (err) => {
          console.error('err=>', err)
        }
      )
    }
  }, [accessToken, apikey])

  const makeVideoQuery = (channelId: string) => {
    const params = {
      part: 'snippet',
      key: apikey,
      channelId: channelId,
      maxResults: '20', // 取得数 1でも50でも消費量同じ
      order: 'date',
    }
    return new URLSearchParams(params)
  }

  const getVideos = useCallback(async () => {
    // 何度も取得しないように
    if (!channelIds.length || videos.length > channelIds.length) {
      return
    }
    const videoIds: Videos = []

    const mapResult = channelIds.map((channelId) => {
      if (channelId) {
        const queryParams = makeVideoQuery(channelId)
        return getApi(search_api_url + queryParams).then(
          (result: ResultVideo) => {
            console.log('API videos取得^^^^^^^^^^^^^^^^^^^^^^:', result)
            if (result.items && result.items.length !== 0) {
              const getVideosId: string[] = result.items.map((v, i) => {
                return v.id.videoId
              })
              setVideos((videos) => [...videos, getVideosId])
              videoIds.push(getVideosId)
            }
          },
          (error) => {
            console.error('err=>', error)
          }
        )
      }
    })

    const getAwaitPromiseAll = await Promise.all(mapResult)
    if (videoIds && videoIds.length) {
      sessionStorage.setItem(
        'videoId',
        videoIds
          .map((v) => {
            return v.join().replace(/,/g, ' ')
          })
          .join()
      )
      // sessionに格納した時間も格納
      sessionStorage.setItem('setDate', String(date2))
    }

    console.log('Promise: ', getAwaitPromiseAll)
    console.log('videos!: ', videos)
    console.log('videoIDs: ', videoIds)
    console.log('channelIds!: ', channelIds)
  }, [channelIds, accessToken, date2]) // accessTokenでよくね？

  // useEffect内でawait使えない
  useEffect(() => {
    // ログインした時、videos(session video)が空で channelIdsある時
    // あとは時間経過で実行

    // accessToken || sessionなくてchannelある || 時間経過
    if (
      ((sessionStorage.getItem('videoId')?.length || 0) === 0 && channelIds) ||
      accessToken ||
      sessionDate + 3600000 < date2
    ) {
      getVideos()
    }
  }, [getVideos, accessToken, channelIds, sessionDate])

  const deleteChannel = (channel: string) => {
    const index = channelIds.indexOf(channel)
    if (index != -1) {
      const arr: string[] = channelIds
      arr.splice(index, 1)
      setChannelIds(arr)
      sessionStorage.setItem('channelId', channelIds.join())
      console.log('delete', channelIds)
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
          <GoogleLogin
            clientId={String(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)}
            buttonText='Login'
            // isSignedIn={true}
            onSuccess={onSuccess}
            onFailure={onFailure}
            scope='https://www.googleapis.com/auth/youtube'
            cookiePolicy={'single_host_origin'}
          />
        </div>

        <div>
          <div>
            <br></br>
            {videos &&
              videos.map((v, i) => (
                <div key={i}>
                  <p
                    className='py-0.5 px-2 text-center cursor-pointer bg-red-600 text-white font-bold'
                    onClick={() => deleteChannel(channelIds[i])}
                  >
                    このチャンネルを取得しない
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
        </div>
      </main>
      <footer></footer>
    </div>
  )
}

export default Home
