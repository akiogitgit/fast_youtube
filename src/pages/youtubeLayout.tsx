import type { NextPage } from 'next'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

const YoutubeLayout: NextPage = () => {
  const videoIds = [
    ['uz8uQyFmxuo', '7vpj9UDylyM'],
    ['FKQyGoPzxe4', '0FnsXLmZZMk'],
    ['Zr3SNa6nyIg', 'yV7w3C6ZLkg'],
    ['1G6Ncqeo9js', 'VvFHyvQJNAs'],
    ['oupHYHv_me0', 'A2ti4_lNPL8'],
  ]
  const videoNum = 2

  const [channelIds, setChannelIds] = useState([''])
  useEffect(() => {
    if (sessionStorage.getItem('channelId')) {
      setChannelIds(sessionStorage.getItem('channelId')?.split(',') || [''])
    }
  }, [])

  // console.log('sessionChannel:', channelIds)

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
    <>
      <div>
        <Link href='/'>home</Link>
      </div>
      <div>
        {videoIds.map((v, i) => (
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
    </>
  )
}
export default YoutubeLayout
