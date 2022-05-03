import { NextPage } from 'next'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

interface videoInfo {
  commentCount: number
  favoriteCount: number
  likeCount: number
  viewCount: number
}

const YoutubeTest: NextPage = () => {
  const apikey = String(process.env.NEXT_PUBLIC_YOUTUBE_APIKEY)
  // const apikey = String(process.env.NEXT_PUBLIC_YOUTUBE_APIKEY2)
  // const channelID = 'UCBL4qbfyteUA-KGj3_9G1LA'
  // const channelID = 'KIYOisGOD'
  // const channelID = 'UCZf__ehlCEBPop-_sldpBUQ' // HikakinTV

  const [videos, setVideos] = useState<string[]>([''])
  const [word, setWord] = useState<string>('')
  const [searchWord, setSearchWord] = useState<string>('キヨ')
  const [channelID, setChannelID] = useState<string>('UCZf__ehlCEBPop-_sldpBUQ')
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
          //  items[2].id.channelIdまたはitems[2].snippet.channelId
          // if (result.items && result.items.length !== 0) {
          //   const videosId = result.items.map((v, i) => {
          //     return v.id.videoId
          //   })
          //   setVideos(videosId)
          // }
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
            const videosId = result.items.map((v, i) => {
              return v.id.videoId
            })
            setVideos(videosId)
          }
        },
        (error) => {
          console.error('err=>', error)
        }
      )
  }, [order, apikey, channelID])

  // videoIdから再生回数を取得
  useEffect(() => {
    const params = {
      part: 'statistics', // snippet タイトルサムネとか
      key: apikey,
      id: (videos[0], videos[1]),
    }
    const queryParams = new URLSearchParams(params)
    const video_url =
      videos_api_url +
      'part=statistics' +
      `&key=${apikey}` +
      `&id=${videos.map((v, i) => v + ',')}`
    fetch(video_url)
      .then((res) => res.json())
      .then(
        (result) => {
          console.log('動画情報:', result)
          if (result.items && result.items.length !== 0) {
            const videosId = result.items.map((v, i) => {
              return v.statistics
            })
            setVideoInfo(videosId)
            console.log('info:', videoInfo)
            // console.log('info[1]:', result[1])
            // console.log('comment:', result[1].commentCount)
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
                src={'https://www.youtube.com/embed/' + v}
                frameBorder='0'
                allowFullScreen
              />
              <p>URL: https://www.youtube.com/watch?v={v}</p>
              <ul>
                <li>再生回数：{videoInfo[i].viewCount}</li>
                <li>いいね数：{videoInfo[i].likeCount}</li>
                <li>コメント数：{videoInfo[i].commentCount}</li>
              </ul>
            </div>
          ))}
      </div>
    </>
  )
}
export default YoutubeTest