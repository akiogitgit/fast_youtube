import { NextPage } from 'next'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

interface videos {
  videoId: string
  channelName: string
  title: string
}

interface videoInfo {
  commentCount: number
  favoriteCount: number
  likeCount: number
  viewCount: number
}

const YoutubeTest: NextPage = () => {
  const apikey = String(process.env.NEXT_PUBLIC_YOUTUBE_APIKEY)
  // const apikey = String(process.env.NEXT_PUBLIC_YOUTUBE_APIKEY2)

  const [videos, setVideos] = useState<videos[]>([])
  const [word, setWord] = useState<string>('')
  const [searchWord, setSearchWord] = useState<string>('キヨ')
  const [channelID, setChannelID] = useState<string>('UCMJiPpN_09F0aWpQrgbc_qg') //('UCZf__ehlCEBPop-_sldpBUQ')
  const [order, setOrder] = useState<string>('date') //viewCount
  const [videoInfo, setVideoInfo] = useState<videoInfo[]>([])

  const search_api_url = 'https://www.googleapis.com/youtube/v3/search?'
  const videos_api_url = 'https://www.googleapis.com/youtube/v3/videos?'
  // const search_channel_url = 'https://www.googleapis.com/youtube/v3/channel?'

  // チャンネル名からchannelIdを取得
  useEffect(() => {
    const params = {
      part: 'snippet',
      key: apikey,
      type: 'channel', // video, channel, playlist
      q: searchWord, // キヨ、KIYOisGOD
      // type: 'video',
      // channelId: channelID,
      maxResults: '1', // 取得数
      // order: order, // 再生数順
    }
    const queryParams = new URLSearchParams(params)
    fetch(search_api_url + queryParams)
      .then((res) => res.json())
      .then(
        (result) => {
          console.log('channel情報:', result)
          console.log('channelID:', result.items[0].id.channelId)
          // console.log('channelID:', result[0].id.channelId)
          // console.log('タイトル:', result[0].snippet.channelTitle)
          setChannelID(result.items[0].id.channelId)
        },
        (error) => {
          console.error('err=>', error)
        }
      )
  }, [order, apikey, searchWord])

  // channelIDから、動画(videoId)を取得
  useEffect(() => {
    const params = {
      part: 'snippet',
      key: apikey,
      channelId: channelID,
      // type: 'channel', // video, channel, playlist
      type: 'video',
      maxResults: '3', // 取得数
      order: order, // 再生数順
    }
    const queryParams = new URLSearchParams(params)
    fetch(search_api_url + queryParams)
      .then((res) => res.json())
      .then(
        (result) => {
          console.log('videoId:', result)
          if (result.items && result.items.length !== 0) {
            // if (result.items[0]) {
            // const info = result.items.map((v, i) => {
            //   return {
            //     videoId: v.id.videoId,
            //     channelName: v.snippet.channelTitle,
            //     title: v.snippet.title,
            //   }
            // })
            // setVideos(info)
            let arr: videos[] = []
            result.items.map((v, i) => {
              arr.push({
                videoId: v.id.videoId,
                channelName: v.snippet.channelTitle,
                title: v.snippet.title,
              })
            })
            setVideos(arr)
            // setVideos([
            //   result.items.map((v, i) => {
            //     return {
            //       videoId: v.id.videoId,
            //       channelName: v.snippet.channelTitle,
            //       title: v.snippet.title,
            //     }
            //   }),
            // ])
            console.log('videos!!!:', videos)

            // const videosId = result.items.map((v, i) => {
            //   return v.id.videoId
            // })
            // setVideos(videosId)
          }
        },
        (error) => {
          console.error('err=>', error)
        }
      )
  }, [order, apikey, channelID])

  // videoIdから再生回数を取得
  useEffect(() => {
    // const params = {
    //   part: 'statistics',
    //   key: apikey,
    //   id: (videos[0], videos[1]),
    // }
    // const queryParams = new URLSearchParams(params)
    const video_url =
      videos_api_url +
      'part=statistics' + // snippet タイトルサムネとか
      `&key=${apikey}` +
      `&id=${videos.map((v, i) => v.videoId + ',')}`
    // `&id=${videos.map((v, i) => v + ',')}`
    fetch(video_url)
      .then((res) => res.json())
      .then(
        (result) => {
          console.log('動画情報:', result)
          if (result.items && result.items.length !== 0) {
            const info = result.items.map((v, i) => {
              return v.statistics
            })
            setVideoInfo(info)
            console.log('info:', videoInfo)
          }
        },
        (error) => {
          console.error('err=>', error)
        }
      )
  }, [videos, apikey])

  const onSearch = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setSearchWord(word)
    },
    [word]
  )
  const changeWord = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setWord(e.target.value)
  }, [])

  return (
    <>
      <Link href='/'>index</Link>
      <div className='flex gap-3 flex-wrap'>
        <div onClick={() => setOrder('viewCount')}>再生回数順</div>
        <div onClick={() => setOrder('rating')}>いいね順</div>
        <div onClick={() => setOrder('data')}>新着順</div>
        <div onClick={() => setOrder('relevance')}>関連性順</div>
        <div onClick={() => setOrder('title')}>アルファベット順</div>
        <div onClick={() => setOrder('videoCount')}>アップロード順</div>
      </div>
      <div>
        <form onSubmit={(e) => onSearch(e)}>
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
      </div>
      <div>
        {videos &&
          videos.map((v, i) => (
            <div key={i}>
              <iframe
                id='player'
                width='640'
                height='360'
                // src={'https://www.youtube.com/embed/' + v}
                src={'https://www.youtube.com/embed/' + v.videoId}
                frameBorder='0'
                allowFullScreen
              />
              {/* <a href={`https://www.youtube.com/watch?v=${v}`}>youtube で見る</a> */}
              <a href={`https://www.youtube.com/watch?v=${v.videoId}`}>
                youtube で見る
              </a>
              <p>{v.channelName}</p>
              <p>{v.title}</p>
              {videoInfo[0] && (
                <ul>
                  <li>再生回数：{videoInfo[i].viewCount}</li>
                  <li>いいね数：{videoInfo[i].likeCount}</li>
                  <li>コメント数：{videoInfo[i].commentCount}</li>
                </ul>
              )}
            </div>
          ))}
      </div>
    </>
  )
}
export default YoutubeTest
